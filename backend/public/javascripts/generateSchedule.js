const { DateTime } = require("luxon");
const Doctors = require("../../models/doctors");

class NightDutyScheduler {
    constructor(doctors, month, year, dutiesPerDay) {
        this.doctors = doctors;
        this.month = month;
        this.year = year;
        this.schedule = [];
        this.dutiesPerDay = dutiesPerDay;
        this.startDate = DateTime.fromObject({ year: year, month: month, day: 1 });
        this.currentDate = this.startDate;
        this.daysInMonth = this.startDate.daysInMonth;
        this.numOfDays = 0;
        this.lastDutyDate = null;
        this.doctorDutyCount = new Map(doctors.map(doctor => [doctor.name, 0]));
    }

    async generateSchedule() {
        return this.backtrackSearch(this.startDate);
    }

    async backtrackSearch(currentDate) {
        // console.log(`Backtracking on date: ${currentDate.toISODate()}`);

        if (this.numOfDays == this.daysInMonth) {
            return this.schedule;
        }

        const assignedDoctors = [];
        const availableDoctors = [...this.doctors];
        const assignedDoctorNames = new Set();

        for (let j = 0; j < this.dutiesPerDay; j++) {
            let selectedDoctor = null;
            for (let attempt = 0; attempt < 3; attempt++) {
                let candidateDoctors = [];

                if (attempt === 0) {
                    
                    candidateDoctors = availableDoctors.filter(d =>
                        !assignedDoctorNames.has(d.name)
                    );
                    selectedDoctor = await this.getPossibleDoctor(currentDate, candidateDoctors);
                } else if (attempt === 1) {
                    
                    candidateDoctors = this.doctors.filter(d =>
                        !assignedDoctorNames.has(d.name)
                    );
                    selectedDoctor = await this.getPossibleDoctor(currentDate, candidateDoctors);
                } else {
                    
                    candidateDoctors = this.doctors.filter(d =>
                        !assignedDoctorNames.has(d.name)
                    );
                    selectedDoctor = await this.getAnyAvailableDoctor(currentDate, candidateDoctors);
                }

                // console.log(`Attempt ${attempt + 1}: Selected doctor for ${currentDate.toISODate()}: ${selectedDoctor?.name || 'None'}`);

                if (selectedDoctor) {
                    const index = availableDoctors.findIndex(d => d.name === selectedDoctor.name);
                    if (index !== -1) {
                        availableDoctors.splice(index, 1);
                    }

                    this.doctorDutyCount.set(selectedDoctor.name,
                        (this.doctorDutyCount.get(selectedDoctor.name) || 0) + 1
                    );

                    if (this.isWeekend(currentDate)) {
                        selectedDoctor.weekendDuties = (selectedDoctor.weekendDuties || 0) + 1;
                    }

                    selectedDoctor.lastDutyDate = currentDate.toISODate();
                    // console.log(`Doctor ${selectedDoctor.name}'s last duty date: ${selectedDoctor.lastDutyDate}`);
                    assignedDoctorNames.add(selectedDoctor.name);

                    // console.log(`Assigning doctor: ${selectedDoctor.name}, Duty Count: ${this.doctorDutyCount.get(selectedDoctor.name)}, Last Duty Date: ${selectedDoctor.lastDutyDate}`);

                    assignedDoctors.push(selectedDoctor);
                    break;
                }
            }

            if (!selectedDoctor) {
                // console.log(`No valid doctor found for ${currentDate.toISODate()}, need to backtrack`);
                assignedDoctors.forEach(doctor => {
                    this.doctorDutyCount.set(doctor.name,
                        (this.doctorDutyCount.get(doctor.name) || 1) - 1
                    );
                    doctor.lastDutyDate = null;
                    assignedDoctorNames.delete(doctor.name);
                });
                
                const previousDate = currentDate.minus({ days: 1 });
                this.numOfDays--;
                return this.backtrackSearch(previousDate);
            }
        }
        this.schedule.push({
            date: currentDate.toISODate(),
            doctors: assignedDoctors.map(d => d.name)
        });
        const nextDate = currentDate.plus({ days: 1 });
        this.numOfDays++;
        const result = await this.backtrackSearch(nextDate);
        if (result) {
            return result;
        }
        this.schedule.pop();
        return false;
    }

    async getPossibleDoctor(date, doctors) {
        const possibleDoctors = await Promise.all(
            doctors.map(async doctor => {
                const blockedDates = await this.getBlockedDates(doctor);
                const daysSinceLastDuty = this.calculateDaysSinceLastDuty(doctor, date);
                const nearestBlockedDate = this.findNearestBlockedDate(date, blockedDates);

               
                const previousDate = date.minus({ days: 1 }).toISODate();
                const wasAssignedPreviousDay = this.schedule.some(
                    scheduleEntry =>
                        scheduleEntry.date === previousDate &&
                        scheduleEntry.doctors.includes(doctor.name)
                );

                return {
                    doctor,
                    daysSinceLastDuty,
                    dutyCount: this.doctorDutyCount.get(doctor.name) || 0,
                    blockedDates,
                    nearestBlockedDate,
                    isBlocked: blockedDates.includes(date.toISODate()),
                    wasAssignedPreviousDay
                };
            })
        );

        
        const filteredDoctors = possibleDoctors.filter(item => {
            const hasMinimumGap = item.daysSinceLastDuty >= 2;
            const canBeAssignedBeforeBlockedDay = item.nearestBlockedDate && item.nearestBlockedDate > date;
            return !item.wasAssignedPreviousDay && hasMinimumGap && canBeAssignedBeforeBlockedDay;
        });

        
        filteredDoctors.sort((a, b) => {
            if (a.daysSinceLastDuty !== b.daysSinceLastDuty) {
                return b.daysSinceLastDuty - a.daysSinceLastDuty;
            }
            return a.dutyCount - b.dutyCount;
        });

       
        if (filteredDoctors.length === 0) {
            // console.log(`No doctors found for ${date.toISODate()}, relaxing constraints`);

            const relaxedDoctors = possibleDoctors.filter(item => !item.isBlocked);
            relaxedDoctors.sort((a, b) => {
               
                if (a.daysSinceLastDuty <= 1) {
                    return 1; 
                }
                if (a.dutyCount !== b.dutyCount) {
                    return a.dutyCount - b.dutyCount;
                }
                return b.daysSinceLastDuty - a.daysSinceLastDuty;
            });

            if (relaxedDoctors.length === 0) {
                return null; 
            }

            return relaxedDoctors[0]?.doctor;
        }

        return filteredDoctors[0]?.doctor;
    }

    findNearestBlockedDate(date, blockedDates) {
        const blockedDateObjects = blockedDates.map(blockedDate => DateTime.fromISO(blockedDate));
        const sortedBlockedDates = blockedDateObjects.sort((a, b) => a - b);
        const nearestBlockedDate = sortedBlockedDates.find(blockedDate => blockedDate < date);
        return nearestBlockedDate ? nearestBlockedDate.toISODate() : null;
    }

    getAnyAvailableDoctor(date, doctors) {
        for (const doctor of doctors) {
            if (this.calculateDaysSinceLastDuty(doctor, date) >= 2) {
                return doctor;
            }
        }
        return null;
    }

    async getBlockedDates(doctor) {
        try {
            const doctorRecord = await Doctors.findOne({ name: doctor.name }).select('blockedDates');
            if (doctorRecord && doctorRecord.blockedDates) {
                const convertedBlockedDates = doctorRecord.blockedDates.map(date => {
                    const timestamp = parseInt(date, 10);
                    if (isNaN(timestamp)) {
                        console.error(`Invalid blocked date: ${date}`);
                        return null;
                    }
                    return DateTime.fromMillis(timestamp).toISODate();
                }).filter(date => date !== null);
                return convertedBlockedDates;
            } else {
                // console.log(`No blocked dates found for ${doctor.name}`);
                return [];
            }
        } catch (err) {
            console.error(`Error fetching blocked dates for ${doctor.name}:`, err);
            return [];
        }
    }

    isWeekend(date) {
        return date.weekday >= 6;
    }

    calculateDaysSinceLastDuty(doctor, currentDate) {
        if (!doctor.lastDutyDate) {
            console.error(`Doctor ${doctor.name} has no last duty date!`);
            return Infinity;
        }

        const lastDutyDate = DateTime.fromJSDate(new Date(doctor.lastDutyDate)).startOf('day');
        const currentDay = currentDate.startOf('day');

        if (!lastDutyDate.isValid) {
            console.error(`Invalid last duty date for ${doctor.name}: ${doctor.lastDutyDate}`);
            return Infinity;
        }

        const gap = currentDay.diff(lastDutyDate, 'days').days;
        // console.log(`Gap for ${doctor.name}: ${gap} days since last duty`);
        return gap;
    }

    calculateWeekendDutiesThreshold() {
        const totalWeekendDates = Math.floor(this.daysInMonth * (2 / 7));
        return Math.floor(totalWeekendDates * this.dutiesPerDay) + 1;
    }
}

module.exports = NightDutyScheduler;
