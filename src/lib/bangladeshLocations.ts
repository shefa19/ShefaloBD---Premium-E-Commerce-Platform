export interface DivisionData {
  name: string;
  districts: string[];
}

export const BANGLADESH_LOCATIONS: Record<string, string[]> = {
  'Dhaka Division': [
    'Dhaka',
    'Gazipur',
    'Narayanganj',
    'Tangail',
    'Faridpur',
    'Kishoreganj',
    'Manikganj',
    'Munshiganj',
    'Narsingdi',
    'Rajbari',
    'Shariatpur',
    'Gopalganj',
    'Madaripur'
  ],
  'Chittagong Division': [
    'Chittagong (Chattogram)',
    'Cox\'s Bazar',
    'Comilla (Cumilla)',
    'Feni',
    'Noakhali',
    'Brahmanbaria',
    'Chandpur',
    'Lakshmipur',
    'Rangamati',
    'Bandarban',
    'Khagrachhari'
  ],
  'Rajshahi Division': [
    'Rajshahi',
    'Bogra (Bogura)',
    'Pabna',
    'Naogaon',
    'Natore',
    'Chapainawabganj',
    'Joypurhat',
    'Sirajganj'
  ],
  'Khulna Division': [
    'Khulna',
    'Jessore (Jashore)',
    'Kushtia',
    'Satkhira',
    'Bagerhat',
    'Chuadanga',
    'Jhenaidah',
    'Magura',
    'Meherpur',
    'Narail'
  ],
  'Barisal Division': [
    'Barisal (Barishal)',
    'Bhola',
    'Barguna',
    'Jhalokati',
    'Patuakhali',
    'Pirojpur'
  ],
  'Sylhet Division': [
    'Sylhet',
    'Moulvibazar',
    'Habiganj',
    'Sunamganj'
  ],
  'Rangpur Division': [
    'Rangpur',
    'Dinajpur',
    'Gaibandha',
    'Kurigram',
    'Lalmonirhat',
    'Nilphamari',
    'Panchagarh',
    'Thakurgaon'
  ],
  'Mymensingh Division': [
    'Mymensingh',
    'Jamalpur',
    'Netrokona',
    'Sherpur'
  ]
};

export const BANGLADESH_DIVISIONS = Object.keys(BANGLADESH_LOCATIONS);

export const getDistrictsForDivision = (division: string): string[] => {
  return BANGLADESH_LOCATIONS[division] || BANGLADESH_LOCATIONS['Dhaka Division'];
};
