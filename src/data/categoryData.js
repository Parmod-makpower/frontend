const labels = [
  "AUDIO",
  "TWS",
  "DATA CABLE",
  "CHARGER",
  "BLUETOOTH",
  "HANDSFREE",
  "SPEAKER",
  "POWER BANK",
  "CAR CHARGER",
  "POLYMER BATTERY",
  "MOBILE HOLDER",
  "BLUETOOTH CELL",
  "CAR BLUETOOTH",
  "CARD READER",
  "CONNECTOR", 
  "HEADPHONE",
  "MEMORY CARD",
  "BATTERY",
  "ECO BATTERY",
  "AUX CABLE",
  "O.T.G",
  "PENDRIVE", 
  "PROMOTIONAL ITEM",
  "SMART WATCH",
  "TEMPERED BODYGUARD",
  "TEMPERED FIGHTER",
  "TEMPERED SUPER X",
  "USB HUB",
  "UV TEMPERED"
];


const keywords = [
  "AUDIO",
  "TWS",
  "DATA CABLE",
  "CHARGER",
  "BLUETOOTH",
  "HANDSFREE",
  "SPEAKER",
  "POWER BANK",
  "CAR CHARGER",
  "POLYMER BATTERY",
  "MOBILE HOLDER",
  "BLUETOOTH CELL",
  "CAR BLUETOOTH",
  "CARD READER",
  "CONNECTOR", 
  "HEADPHONE",
  "MEMORY CARD",
  "BATTERY",
  "ECO BATTERY",
  "AUX CABLE",
  "O.T.G",
  "PENDRIVE", 
  "PROMOTIONAL ITEM",
  "SMART WATCH",
  "TEMPERED BODYGUARD",
  "TEMPERED FIGHTER",
  "TEMPERED SUPER X",
  "USB HUB",
  "UV TEMPERED"
];


// Images
const images = [
  "https://makpowerindia.com/cdn/shop/files/Mak_Power_DJ_MINI_60W_Bluetooth_Floor_Standing_Speaker.webp?v=1753438499",

  "https://makpowerindia.com/cdn/shop/files/yn1aidtydvalu4i7rb7o.webp?v=1745471904",

  "https://makpowerindia.com/cdn/shop/files/Makpower_35W_Micro-_USB_Cable_Fast_Charging_for_data_transfer.webp?v=1744276440",
  
  "https://makpowerindia.com/cdn/shop/files/slohk7hxowdsfjgdgbrp.webp?v=1741173178",
  
  "https://makpowerindia.com/cdn/shop/files/Mak_Power_Arctic_Tones_Neckband_Blue_with_100_Hours_of_Playtime.webp?v=1751536772",

  
  "https://makpowerindia.com/cdn/shop/files/shcd66vwggvqiypcv7g0.webp?v=1742368147",

  
  "https://makpowerindia.com/cdn/shop/files/gdyfgbtfvso08wg8vfoh.webp?v=1745927904",
  
  "https://makpowerindia.com/cdn/shop/files/10000mAh_power_bank_with_digital_display.webp?v=1753350124",

  "https://makpowerindia.com/cdn/shop/files/Mak_Power_BOOST_POWER_18W_Dual_USB_Car_Charger_Black.webp?v=1756114532",

  "https://cdn.dotpe.in/longtail/store-items/8957493/tVaKLcpO.webp",

  "https://makpowerindia.com/cdn/shop/files/Best_Car_Mobile_Holder_Secure_Adjustable_amp_Hands-Free_Navigation.webp?v=1739609931",

  "https://makpowerindia.com/cdn/shop/files/Best_Fast_Dual_USB_Car_Charger_Black.webp?v=1742636246",
  
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s",
  
];

// Combine them into categories
const categories = labels.map((label, index) => ({
  label,
  keyword: keywords[index],
  image: images[index],
}));

export default categories;
