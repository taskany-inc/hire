import { add, format } from 'date-fns';

export type SplitDateValueResult = {
    hours: number;
    minutes: number;
};

export const getDurationString = (duration: number): string => {
    if (duration < 60) {
        return `${duration}min.`;
    }
    const hours = `${duration / 60}`.replace('.', ',');

    return `${hours}h.`;
};

export const getOptionsWithDuration = (startTime: Date): { value: number; text: string }[] => {
    const options = [];
    let duration = 0;

    for (let index = 0; index < 49; index++) {
        const newDate = add(startTime, { minutes: duration });

        options.push({
            value: duration,
            text: `${format(newDate, 'H:mm')} (${getDurationString(duration)})`,
        });
        duration = index <= 3 ? (duration += 15) : (duration += 30);
    }

    return options;
};

export const getStringTime = (hours: number, minutes: number): string => {
    const h = hours < 10 ? `0${hours}` : hours;
    const m = minutes < 10 ? `0${minutes}` : minutes;

    return `${h}:${m}`;
};

const STEP = 15;

export const getOptions = (step = STEP): { text: string; value: string }[] => {
    const options = [];

    for (let hours = 0; hours < 24; hours++) {
        for (let minutes = 0; minutes < 60; minutes += step) {
            options.push({ text: getStringTime(hours, minutes), value: getStringTime(hours, minutes) });
        }
    }

    return options;
};

export const splitDateValue = (value: string): SplitDateValueResult => ({
    hours: Number(value.split(':')[0]),
    minutes: Number(value.split(':')[1]),
});
