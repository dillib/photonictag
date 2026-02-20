
/**
 * SAP to PhotonicTag Field Mappings & Static Data
 */

export const PLANT_MAP: Record<string, string> = {
    '1000': 'EV Manufacturing GmbH',
    '1010': 'EV Assembly Inc.',
    '2000': 'Battery Systems Ltd.',
    '2010': 'Advanced Energy Solutions',
    '3000': 'Electronics Corp.',
    '3010': 'Tech Manufacturing',
    '4000': 'Sustainable Textiles',
    '4010': 'Eco Fashion Group',
    '5000': 'Organic Foods Ltd.',
    '5010': 'Fair Trade Suppliers',
    '6000': 'Pharma Manufacturing',
    '6010': 'MedTech Solutions',
    '7000': 'Green Chemicals Inc.',
    '7010': 'Sustainable Materials',
    '8000': 'Auto Parts International',
    '8010': 'Precision Components'
};

export const CATEGORY_MAP: Record<string, string> = {
    'EV': 'Electric Vehicles',
    'BAT': 'Batteries',
    'ELEC': 'Electronics',
    'FASH': 'Fashion & Textiles',
    'FOOD': 'Food & Beverage',
    'PHARM': 'Pharmaceuticals',
    'CHEM': 'Chemicals',
    'AUTO': 'Automotive Parts'
};

/**
 * Reverse lookup for plant code by manufacturer name
 */
export function getPlantCode(manufacturerName: string): string {
    if (manufacturerName.includes('EV')) return '1000';
    if (manufacturerName.includes('Battery')) return '2000';
    if (manufacturerName.includes('Electron')) return '3000';
    if (manufacturerName.includes('Textile') || manufacturerName.includes('Fashion')) return '4000';
    if (manufacturerName.includes('Food')) return '5000';
    if (manufacturerName.includes('Pharma')) return '6000';
    if (manufacturerName.includes('Chemical')) return '7000';
    if (manufacturerName.includes('Auto')) return '8000';
    return '9999';
}

/**
 * Reverse lookup for category code
 */
export function reverseMapCategory(category: string | null): string {
    if (!category) return 'GEN';

    const catLower = category.toLowerCase();
    if (catLower.includes('electric') || catLower.includes('ev')) return 'EV';
    if (catLower.includes('batter')) return 'BAT';
    if (catLower.includes('electron')) return 'ELEC';
    if (catLower.includes('fashion') || catLower.includes('textile')) return 'FASH';
    if (catLower.includes('food')) return 'FOOD';
    if (catLower.includes('pharma')) return 'PHARM';
    if (catLower.includes('chem')) return 'CHEM';
    if (catLower.includes('auto')) return 'AUTO';
    return 'GEN';
}
