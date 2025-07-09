// Comprehensive matching logic for all categories
export const calculateMatchPercentage = (lostItem, foundItem) => {
  // First check if categories match
  if (lostItem.category !== foundItem.category) {
    return {
      percentage: 0,
      reasons: ['Categories do not match'],
      classification: 'No Match'
    };
  }

  let percentage = 0;
  let reasons = [];

  switch (lostItem.category) {
    case 'Money':
      percentage = calculateMoneyMatch(lostItem, foundItem, reasons);
      break;
    case 'Electronics':
      percentage = calculateElectronicsMatch(lostItem, foundItem, reasons);
      break;
    case 'Accessories':
      percentage = calculateAccessoriesMatch(lostItem, foundItem, reasons);
      break;
    case 'Books':
      percentage = calculateBooksMatch(lostItem, foundItem, reasons);
      break;
    case 'ID Cards':
      percentage = calculateIDCardsMatch(lostItem, foundItem, reasons);
      break;
    case 'Others':
      percentage = calculateOthersMatch(lostItem, foundItem, reasons);
      break;
    default:
      return {
        percentage: 0,
        reasons: ['Unknown category'],
        classification: 'No Match'
      };
  }

  // Cap at 100%
  percentage = Math.min(percentage, 100);

  // Classify the match
  let matchClassification = '';
  if (percentage >= 80) {
    matchClassification = 'Strong Match';
  } else if (percentage >= 60) {
    matchClassification = 'Possible Match';
  } else {
    matchClassification = 'Weak or No Match';
  }

  return {
    percentage: Math.round(percentage),
    reasons: reasons,
    classification: matchClassification
  };
};

// Money matching logic
const calculateMoneyMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Item Name → 10%
  if (lostItem.itemName && foundItem.itemName) {
    const lostName = lostItem.itemName.toLowerCase().trim();
    const foundName = foundItem.itemName.toLowerCase().trim();
    
    if (lostName === foundName) {
      percentage += 10;
      reasons.push('Item name matches exactly');
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      percentage += 5;
      reasons.push('Item name partially matches');
    }
  }

  // Money Denominations → 20%
  if (lostItem.moneyDenominations && foundItem.moneyDenominations && 
      lostItem.moneyDenominations.length > 0 && foundItem.moneyDenominations.length > 0) {
    
    const lostDenoms = lostItem.moneyDenominations.map(d => d.denomination.toLowerCase().trim());
    const foundDenoms = foundItem.moneyDenominations.map(d => d.denomination.toLowerCase().trim());
    
    const matchingDenoms = lostDenoms.filter(denom => foundDenoms.includes(denom));
    const totalDenoms = Math.max(lostDenoms.length, foundDenoms.length);
    
    if (matchingDenoms.length === totalDenoms && totalDenoms > 0) {
      percentage += 20;
      reasons.push('All denominations match exactly');
    } else if (matchingDenoms.length > 0) {
      const matchRatio = matchingDenoms.length / totalDenoms;
      percentage += Math.round(20 * matchRatio);
      reasons.push(`${matchingDenoms.length} out of ${totalDenoms} denominations match`);
    }
  }

  // Total Amount → 25%
  if (lostItem.totalAmount && foundItem.totalAmount) {
    if (lostItem.totalAmount === foundItem.totalAmount) {
      percentage += 25;
      reasons.push('Total amount matches exactly');
    } else {
      const amountDiff = Math.abs(lostItem.totalAmount - foundItem.totalAmount);
      const percentDiff = (amountDiff / Math.max(lostItem.totalAmount, foundItem.totalAmount)) * 100;
      
      if (percentDiff <= 10) {
        percentage += 20;
        reasons.push('Total amount is very close (within 10%)');
      } else if (percentDiff <= 25) {
        percentage += 15;
        reasons.push('Total amount is close (within 25%)');
      } else if (percentDiff <= 50) {
        percentage += 10;
        reasons.push('Total amount is somewhat close (within 50%)');
      }
    }
  }

  // Found/Lost Place → 20%
  percentage += calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 20, reasons);

  // Date → 15%
  percentage += calculateDateMatch(lostItem.lostDateTime, foundItem.foundDateTime, 15, reasons);

  // Description → 10%
  percentage += calculateDescriptionMatch(lostItem.description, foundItem.description, 10, reasons);

  return percentage;
};

// Electronics matching logic
const calculateElectronicsMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Item Name → 30%
  if (lostItem.itemName && foundItem.itemName) {
    const lostName = lostItem.itemName.toLowerCase().trim();
    const foundName = foundItem.itemName.toLowerCase().trim();
    
    if (lostName === foundName) {
      percentage += 30;
      reasons.push('Item name matches exactly');
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      percentage += 20;
      reasons.push('Item name partially matches');
    }
  }

  // Brand → 30%
  if (lostItem.brand && foundItem.brand) {
    const lostBrand = lostItem.brand.toLowerCase().trim();
    const foundBrand = foundItem.brand.toLowerCase().trim();
    
    if (lostBrand === foundBrand) {
      percentage += 30;
      reasons.push('Brand matches exactly');
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      percentage += 20;
      reasons.push('Brand partially matches');
    }
  }

  // Model → 20% (only if provided)
  if (lostItem.model && foundItem.model) {
    const lostModel = lostItem.model.toLowerCase().trim();
    const foundModel = foundItem.model.toLowerCase().trim();
    
    if (lostModel === foundModel) {
      percentage += 20;
      reasons.push('Model matches exactly');
    } else if (lostModel.includes(foundModel) || foundModel.includes(lostModel)) {
      percentage += 15;
      reasons.push('Model partially matches');
    }
  }

  // Date and Place → 20%
  const placeMatch = calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 10, reasons);
  const dateMatch = calculateDateMatch(lostItem.lostDateTime, foundItem.foundDateTime, 10, reasons);
  percentage += placeMatch + dateMatch;

  return percentage;
};

// Accessories matching logic
const calculateAccessoriesMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Item Name → 40%
  if (lostItem.itemName && foundItem.itemName) {
    const lostName = lostItem.itemName.toLowerCase().trim();
    const foundName = foundItem.itemName.toLowerCase().trim();
    
    if (lostName === foundName) {
      percentage += 40;
      reasons.push('Item name matches exactly');
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      percentage += 30;
      reasons.push('Item name partially matches');
    }
  }

  // Description → 30%
  percentage += calculateDescriptionMatch(lostItem.description, foundItem.description, 30, reasons);

  // Date and Place → 30%
  const placeMatch = calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 15, reasons);
  const dateMatch = calculateDateMatch(lostItem.lostDateTime, foundItem.foundDateTime, 15, reasons);
  percentage += placeMatch + dateMatch;

  return percentage;
};

// Books matching logic
const calculateBooksMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Book Title → 40%
  if (lostItem.bookTitle && foundItem.bookTitle) {
    const lostTitle = lostItem.bookTitle.toLowerCase().trim();
    const foundTitle = foundItem.bookTitle.toLowerCase().trim();
    
    if (lostTitle === foundTitle) {
      percentage += 40;
      reasons.push('Book title matches exactly');
    } else if (lostTitle.includes(foundTitle) || foundTitle.includes(lostTitle)) {
      percentage += 30;
      reasons.push('Book title partially matches');
    }
  }

  // Author → 30%
  if (lostItem.author && foundItem.author) {
    const lostAuthor = lostItem.author.toLowerCase().trim();
    const foundAuthor = foundItem.author.toLowerCase().trim();
    
    if (lostAuthor === foundAuthor) {
      percentage += 30;
      reasons.push('Author matches exactly');
    } else if (lostAuthor.includes(foundAuthor) || foundAuthor.includes(lostAuthor)) {
      percentage += 20;
      reasons.push('Author partially matches');
    }
  }

  // Date and Place → 30%
  const placeMatch = calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 15, reasons);
  const dateMatch = calculateDateMatch(lostItem.lostDateTime, foundItem.foundDateTime, 15, reasons);
  percentage += placeMatch + dateMatch;

  return percentage;
};

// ID Cards matching logic
const calculateIDCardsMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Roll Number → 50%
  if (lostItem.rollNumber && foundItem.rollNumber) {
    const lostRoll = lostItem.rollNumber.toLowerCase().trim();
    const foundRoll = foundItem.rollNumber.toLowerCase().trim();
    
    if (lostRoll === foundRoll) {
      percentage += 50;
      reasons.push('Roll number matches exactly');
    } else if (lostRoll.includes(foundRoll) || foundRoll.includes(lostRoll)) {
      percentage += 30;
      reasons.push('Roll number partially matches');
    }
  }

  // Name → 30%
  if (lostItem.name && foundItem.name) {
    const lostName = lostItem.name.toLowerCase().trim();
    const foundName = foundItem.name.toLowerCase().trim();
    
    if (lostName === foundName) {
      percentage += 30;
      reasons.push('Name matches exactly');
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      percentage += 20;
      reasons.push('Name partially matches');
    }
  }

  // Place → 20%
  percentage += calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 20, reasons);

  return percentage;
};

// Others matching logic
const calculateOthersMatch = (lostItem, foundItem, reasons) => {
  let percentage = 0;

  // Item Name → 40%
  if (lostItem.itemName && foundItem.itemName) {
    const lostName = lostItem.itemName.toLowerCase().trim();
    const foundName = foundItem.itemName.toLowerCase().trim();
    
    if (lostName === foundName) {
      percentage += 40;
      reasons.push('Item name matches exactly');
    } else if (lostName.includes(foundName) || foundName.includes(lostName)) {
      percentage += 30;
      reasons.push('Item name partially matches');
    }
  }

  // Description → 30%
  percentage += calculateDescriptionMatch(lostItem.description, foundItem.description, 30, reasons);

  // Date and Place → 30%
  const placeMatch = calculatePlaceMatch(lostItem.lostPlace, foundItem.foundPlace, 15, reasons);
  const dateMatch = calculateDateMatch(lostItem.lostDateTime, foundItem.foundDateTime, 15, reasons);
  percentage += placeMatch + dateMatch;

  return percentage;
};

// Helper function for place matching
const calculatePlaceMatch = (lostPlace, foundPlace, maxPoints, reasons) => {
  if (!lostPlace || !foundPlace) return 0;
  
  const lost = lostPlace.toLowerCase().trim();
  const found = foundPlace.toLowerCase().trim();
  
  if (lost === found) {
    reasons.push('Location matches exactly');
    return maxPoints;
  } else if (lost.includes(found) || found.includes(lost)) {
    reasons.push('Location partially matches');
    return Math.round(maxPoints * 0.75);
  } else {
    // Check for nearby locations (same building, area, etc.)
    const commonWords = ['building', 'floor', 'room', 'hall', 'campus', 'area', 'street', 'road'];
    const lostWords = lost.split(' ');
    const foundWords = found.split(' ');
    
    const commonMatches = commonWords.filter(word => 
      lostWords.includes(word) && foundWords.includes(word)
    );
    
    if (commonMatches.length > 0) {
      reasons.push(`Same area/location type: ${commonMatches.join(', ')}`);
      return Math.round(maxPoints * 0.5);
    }
  }
  
  return 0;
};

// Helper function for date matching
const calculateDateMatch = (lostDateTime, foundDateTime, maxPoints, reasons) => {
  if (!lostDateTime || !foundDateTime) return 0;
  
  const lostDate = new Date(lostDateTime);
  const foundDate = new Date(foundDateTime);
  
  // Check if dates are the same day
  const lostDay = lostDate.toDateString();
  const foundDay = foundDate.toDateString();
  
  if (lostDay === foundDay) {
    reasons.push('Same date');
    return maxPoints;
  } else {
    // Check if dates are within 3 days
    const timeDiff = Math.abs(lostDate.getTime() - foundDate.getTime());
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (daysDiff <= 3) {
      reasons.push('Dates within 3 days');
      return Math.round(maxPoints * 0.67);
    } else if (daysDiff <= 7) {
      reasons.push('Dates within a week');
      return Math.round(maxPoints * 0.33);
    }
  }
  
  return 0;
};

// Helper function for description matching
const calculateDescriptionMatch = (lostDesc, foundDesc, maxPoints, reasons) => {
  if (!lostDesc || !foundDesc) return 0;
  
  const lost = lostDesc.toLowerCase().trim();
  const found = foundDesc.toLowerCase().trim();
  
  if (lost === found) {
    reasons.push('Description matches exactly');
    return maxPoints;
  } else if (lost.includes(found) || found.includes(lost)) {
    reasons.push('Description partially matches');
    return Math.round(maxPoints * 0.7);
  } else {
    // Check for common keywords
    const lostWords = lost.split(' ').filter(word => word.length > 3);
    const foundWords = found.split(' ').filter(word => word.length > 3);
    
    const commonWords = lostWords.filter(word => foundWords.includes(word));
    if (commonWords.length >= 2) {
      reasons.push(`Common description keywords: ${commonWords.slice(0, 3).join(', ')}`);
      return Math.round(maxPoints * 0.3);
    }
  }
  
  return 0;
}; 