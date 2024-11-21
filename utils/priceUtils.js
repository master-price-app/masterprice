// Calculate if a price is within the current deal cycle for a mart
export const isWithinCurrentCycle = (priceDate, martCycle) => {
  const today = new Date();
  const priceDateTime = new Date(priceDate);

  // Get the current cycle's start and end dates
  let cycleStart = new Date(today);
  let cycleEnd = new Date(today);

  // Find the most recent start day
  while (cycleStart.getDay() !== martCycle.startDay) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }

  // Find the upcoming end day
  while (cycleEnd.getDay() !== martCycle.endDay) {
    cycleEnd.setDate(cycleEnd.getDate() + 1);
  }

  // If we've passed the end day, move to next week's end
  if (today > cycleEnd) {
    cycleEnd.setDate(cycleEnd.getDate() + 7);
  }

  // Reset times to start/end of day for accurate comparison
  cycleStart.setHours(0, 0, 0, 0);
  cycleEnd.setHours(23, 59, 59, 999);

  return priceDateTime >= cycleStart && priceDateTime <= cycleEnd;
};


// Determine if a price qualifies as a master price
export const isMasterPrice = (price, allPrices, martCycle) => {
  // First check if the price is within current cycle
  if (!isWithinCurrentCycle(price.createdAt, martCycle)) {
    return false;
  }

  // Get all valid prices within the current cycle
  const validPrices = allPrices.filter((p) =>
    isWithinCurrentCycle(p.createdAt, martCycle)
  );

  // Find the lowest price among valid prices
  const lowestPrice = Math.min(...validPrices.map((p) => p.price));

  // Return true if this price is the lowest valid price
  return price.price === lowestPrice;
};
