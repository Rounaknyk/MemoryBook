import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Memory } from '@/types/memory';
import { generateNostalgicMessage } from '@/lib/gemini';
import { subMonths, format, subDays, addDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';

export interface TimeMachineData {
    onThisDay: Memory[];
    lastMonth: Memory[];
    lastMonthWeek: Memory[];
    message: string;
}

export async function getTimeMachineMemories(userId: string): Promise<TimeMachineData> {
    console.log('Server Action: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
    try {
        const today = new Date();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentDay = String(today.getDate()).padStart(2, '0');

        const lastMonthDate = subMonths(today, 1);
        const lastMonthStart = subDays(lastMonthDate, 3);
        const lastMonthEnd = addDays(lastMonthDate, 3);

        const memoriesRef = collection(db, 'memories');
        const q = query(memoriesRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        const onThisDay: Memory[] = [];
        const lastMonth: Memory[] = [];
        const lastMonthWeek: Memory[] = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const memoryDate = parseISO(data.date);
            const memory: Memory = { id: doc.id, ...data } as Memory;

            // 1. On This Day (Previous Years)
            if (data.date.endsWith(`-${currentMonth}-${currentDay}`)) {
                const memoryYear = data.date.split('-')[0];
                if (parseInt(memoryYear) < today.getFullYear()) {
                    onThisDay.push(memory);
                }
            }

            // 2. Last Month (Same Date)
            if (isSameDay(memoryDate, lastMonthDate)) {
                lastMonth.push(memory);
            }

            // 3. Last Month (Same Week - approx +/- 3 days)
            // Exclude the exact day to avoid duplication if we show them separately
            if (isWithinInterval(memoryDate, { start: lastMonthStart, end: lastMonthEnd }) && !isSameDay(memoryDate, lastMonthDate)) {
                lastMonthWeek.push(memory);
            }
        });

        // Sort by date
        onThisDay.sort((a, b) => a.date.localeCompare(b.date));
        lastMonth.sort((a, b) => a.date.localeCompare(b.date));
        lastMonthWeek.sort((a, b) => a.date.localeCompare(b.date));

        const allMemories = [...onThisDay, ...lastMonth, ...lastMonthWeek];

        if (allMemories.length === 0) {
            return { onThisDay: [], lastMonth: [], lastMonthWeek: [], message: '' };
        }

        const message = await generateNostalgicMessage(onThisDay, lastMonth, lastMonthWeek);

        return {
            onThisDay,
            lastMonth,
            lastMonthWeek,
            message
        };
    } catch (error) {
        console.error('Error fetching Time Machine memories:', error);
        return { onThisDay: [], lastMonth: [], lastMonthWeek: [], message: '' };
    }
}
