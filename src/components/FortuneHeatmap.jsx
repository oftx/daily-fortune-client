import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { HEATMAP_COLOR_LEVELS } from '../utils/constants';

const FortuneHeatmap = ({ data }) => {
    const values = data.map(item => ({
        date: item.date,
        count: HEATMAP_COLOR_LEVELS[item.fortune] || 0,
    }));

    const colorClassForValue = (value) => {
        if (!value || value.count === 0) {
            return 'color-empty';
        }
        return `color-level-${value.count}`;
    };

    return (
        <div className="heatmap-container">
            <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={values}
                classForValue={colorClassForValue}
                // *** FIX: Use correct data attributes for react-tooltip v5 ***
                tooltipDataAttrs={value => {
                    if (!value || !value.date) return null;
                    const fortune = Object.keys(HEATMAP_COLOR_LEVELS).find(key => HEATMAP_COLOR_LEVELS[key] === value.count);
                    const content = `${value.date}: ${fortune || 'No draw'}`;
                    return {
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': content,
                    };
                }}
            />
        </div>
    );
};

export default FortuneHeatmap;