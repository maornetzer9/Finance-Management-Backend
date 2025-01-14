const moment = require("moment-timezone");

const hebrewMonths = {
    ינואר: [1],
    פברואר: [2],
    מרץ: [3],
    אפריל: [4],
    מאי: [5],
    יוני: [6],
    יולי: [7],
    אוגוסט: [8],
    ספטמבר: [9],
    אוקטובר: [10],
    נובמבר: [11],
    דצמבר: [12],
};

const filterDataByHebrewMonth = async (data, hebrewMonthName) => {

    const gregorianMonths = hebrewMonths[hebrewMonthName];

    if (!gregorianMonths) 
    {
        console.error(`Invalid month name: ${hebrewMonthName}`);
        return [];
    }

    return await data.filter((item) => {
        try {
            const itemDate = moment(item.createdAt).tz("Asia/Jerusalem");
            if (!itemDate.isValid()) 
            {
                console.error(`Invalid date: ${item.createdAt}`);
                return false;
            }

            const itemMonth = itemDate.month() + 1; // `month()` is 0-based
            return gregorianMonths.includes(itemMonth);
        } 
        catch (error) 
        {
            console.error("Error processing item:", item, error);
            return false;
        }
    });
};

module.exports = { filterDataByHebrewMonth, hebrewMonths };
