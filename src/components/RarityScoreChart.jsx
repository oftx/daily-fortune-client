import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const RarityScoreChart = ({ data, comparisonData, comparisonName, timezone = 'UTC' }) => {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return <p>{t('noDataAvailable')}</p>;
    }

    // Process data to use timestamps for X-axis (ensures correct time scale)
    // Normalize to start of day in the user's timezone to avoid "vertical lines" 
    // caused by different times on the same day.
    const processData = (rawData) => rawData.map(item => ({
        ...item,
        date: dayjs(item.date).tz(timezone).startOf('day').valueOf(),
        originalDate: item.date
    }));

    const processedData = processData(data);
    const processedComparisonData = comparisonData ? processData(comparisonData) : [];

    // Combine data for domain calculation
    const allScores = processedData.map(d => d.score);
    if (processedComparisonData.length > 0) {
        processedComparisonData.forEach(d => allScores.push(d.score));
    }

    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);

    // Calculate padding
    let padding = (maxScore - minScore) * 0.1;
    if (padding === 0) padding = 1;

    // Find max and min points for annotation (primary user)
    const maxPoint = processedData.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    const minPoint = processedData.reduce((prev, current) => (prev.score < current.score) ? prev : current);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '5px', color: '#fff' }}>
                    <p className="label">{`${dayjs(label).format('YYYY-MM-DD')}`}</p>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ color: entry.color }}>
                            <p className="intro">
                                {entry.name}: {entry.value.toFixed(2)}
                            </p>
                            {entry.payload.fortune && (
                                <p className="desc" style={{ fontSize: '0.8em', opacity: 0.8 }}>
                                    {t('fortune')}: {entry.payload.fortune}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer>
                <LineChart
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                        dataKey="date"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(timestamp) => dayjs(timestamp).format('MM-DD')}
                        stroke="#888"
                    />
                    <YAxis
                        domain={[minScore - padding, maxScore + padding]}
                        stroke="#888"
                        tickFormatter={(value) => value.toFixed(0)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <Line
                        data={processedData}
                        dataKey="score"
                        name={t('me')}
                        type="monotone"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                    />

                    {processedComparisonData.length > 0 && (
                        <Line
                            data={processedComparisonData}
                            dataKey="score"
                            name={comparisonName || t('comparison')}
                            type="monotone"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                        />
                    )}

                    {/* Annotate Max Score (Primary) */}
                    <ReferenceDot
                        x={maxPoint.date}
                        y={maxPoint.score}
                        r={5}
                        fill="red"
                        stroke="none"
                        ifOverflow="extendDomain"
                    />

                    {/* Annotate Min Score (Primary) */}
                    <ReferenceDot
                        x={minPoint.date}
                        y={minPoint.score}
                        r={5}
                        fill="green"
                        stroke="none"
                        ifOverflow="extendDomain"
                    />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RarityScoreChart;
