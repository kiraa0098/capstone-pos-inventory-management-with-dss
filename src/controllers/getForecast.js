const moment = require("moment");
const _ = require("lodash");

/**
 * Function to calculate SMA forecast
 * @param {Object} salesData - The sales data for all products
 * @param {number} windowSize - The size of the rolling window (e.g., 30 days)
 * @returns {Object} Forecast results for each product
 */
function calculateSMAForecast(salesData, windowSize = 30) {
  const forecastResults = {};

  for (const [productId, productSales] of Object.entries(salesData)) {
    // Parse the sales data into a time series
    const timeSeries = productSales.map((sale) => ({
      date: moment(sale.ds),
      quantity: sale.y,
    }));

    // Get the last 30 days
    const startDate = moment().subtract(windowSize, "days");
    const filteredTimeSeries = timeSeries.filter((entry) =>
      entry.date.isSameOrAfter(startDate)
    );

    // Fill in missing dates with zero quantities
    const allDates = _.range(0, windowSize).map((offset) =>
      moment().subtract(offset, "days").format("YYYY-MM-DD")
    );

    const dailySales = _.mapValues(
      _.groupBy(filteredTimeSeries, (entry) => entry.date.format("YYYY-MM-DD")),
      (sales) => _.sumBy(sales, "quantity")
    );

    const fullDailySales = allDates
      .reverse()
      .map((date) => dailySales[date] || 0);

    // Calculate SMA
    const smaValues = [];
    for (let i = 0; i < fullDailySales.length; i++) {
      const slice = fullDailySales.slice(
        Math.max(0, i - windowSize + 1),
        i + 1
      );
      const average = _.mean(slice);
      smaValues.push(average);
    }

    // Forecast future demand
    const leadTimeDemand = _.last(smaValues) * windowSize;

    // Add to results
    forecastResults[productId] = {
      product_name: productSales[0]?.product_name || "Unknown Product",
      lead_time_demand: leadTimeDemand || 0,
    };
  }

  return forecastResults;
}

module.exports = calculateSMAForecast;
