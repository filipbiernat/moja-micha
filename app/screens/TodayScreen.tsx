import React, { useState } from 'react';
import { DayView } from '../../components/DayView';

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function TodayScreen() {
    const [currentDate, setCurrentDate] = useState(getLocalDateString);

    return <DayView date={currentDate} onDateChange={setCurrentDate} />;
}
