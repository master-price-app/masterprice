export const isWithinCurrentCycle = (priceDate, dealCycle) => {
  if (!priceDate || !dealCycle?.startDay) return false;

  const today = new Date();
  const priceDateTime = new Date(priceDate);

  // Convert from 1-7 to 0-6 format for JavaScript's getDay()
  const cycleStartDay = dealCycle.startDay % 7;

  // Find the current cycle start date
  let cycleStart = new Date(today);
  cycleStart.setHours(0, 0, 0, 0);

  // Adjust to current cycle's start
  const currentDay = cycleStart.getDay();
  const diff = currentDay - cycleStartDay;
  if (diff > 0) {
    // Move back to the start of current cycle
    cycleStart.setDate(cycleStart.getDate() - diff);
  } else if (diff < 0) {
    // Move back to the previous cycle start
    cycleStart.setDate(cycleStart.getDate() - (7 + diff));
  }

  // Calculate cycle end
  let cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleStart.getDate() + 6);
  cycleEnd.setHours(23, 59, 59, 999);

  return priceDateTime >= cycleStart && priceDateTime <= cycleEnd;
};

// Determine if a price qualifies as a master price
export const isMasterPrice = (price, allPrices, martCycles) => {
  if (!price || !allPrices?.length || !martCycles) return false;

  // Get the cycle info for this price's location
  const locationCycle = martCycles[price.locationId]?.chain;

  // Price must be within current cycle to be a master price
  if (!isWithinCurrentCycle(price.createdAt, locationCycle)) {
    return false;
  }

  // Filter for valid prices only based on their cycles
  const validPrices = allPrices.filter((p) => {
    const priceCycle = martCycles[p.locationId]?.chain;
    return isWithinCurrentCycle(p.createdAt, priceCycle);
  });

  // If no valid prices, this can't be a master price
  if (validPrices.length === 0) {
    return false;
  }

  // Find the lowest price among valid prices only
  const lowestPrice = Math.min(...validPrices.map((p) => p.price));

  // It's a master price if it's the lowest among valid prices
  return price.price === lowestPrice;
};
