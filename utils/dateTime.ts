import {format as fnsFormat} from 'date-fns';

export const formatDate = (date: Date | undefined, format = "dd.mm.yyyy HH:ii") => {
    if (!date) return null;

    return fnsFormat(date, format);
};