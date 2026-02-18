const aquarius = "♒";
const pisces = "♓";
const aries = "♈";
const taurus = "♉";
const gemini = "♊";
const cancer = "♋";
const leo = "♌";
const virgo = "♏";
const libra = "♎";
const scorpio = "♏";
const ophiuchus = "⛎";
const sagittarius = "♐";
const capricorn = "♑";

const rat = "🐀";
const ox = "🐂";
const tiger = "🐅";
const rabbit = "🐇";
const dragon = "🐉";
const snake = "🐍";
const horse = "🐎";
const goat = "🐐";
const monkey = "🐒";
const rooster = "🐓";
const dog = "🐕";
const pig = "🐖";

const wood = "🌳";
const fire = "🔥";
const earth = "\u{1FAA8}";
const metal = "\u{1FA99}";
const water = "💧";


function getZodiacSign(dateInput) {
  const date = new Date(dateInput);
  const day = date.getDate();
  const month = date.getMonth() + 1; // JS months are 0-indexed

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return aquarius;
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return pisces;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return aries;
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return taurus;
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return gemini;
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return cancer;
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return leo;
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return virgo;
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return libra;
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return scorpio;
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return sagittarius;
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return capricorn;
}

function getRealZodiacSign(dateInput) {
  const date = new Date(dateInput);
  const day = date.getDate();
  const month = date.getMonth() + 1; // JS months are 0-indexed

  if ((month === 2 && day >= 16) || (month === 3 && day <= 11)) return aquarius;
  if ((month === 3 && day >= 12) || (month === 4 && day <= 18)) return pisces;
  if ((month === 4 && day >= 19) || (month === 5 && day <= 13)) return aries;
  if ((month === 5 && day >= 14) || (month === 6 && day <= 19)) return taurus;
  if ((month === 6 && day >= 20) || (month === 7 && day <= 20)) return gemini;
  if ((month === 7 && day >= 21) || (month === 8 && day <= 9)) return cancer;
  if ((month === 8 && day >= 10) || (month === 9 && day <= 15)) return leo;
  if ((month === 9 && day >= 16) || (month === 10 && day <= 30)) return virgo;
  if ((month === 10 && day >= 31) || (month === 11 && day <= 22)) return libra;
  if ((month === 11 && day >= 23) || (month === 11 && day <= 29)) return scorpio;
  if ((month === 11 && day >= 30) || (month === 12 && day <= 17)) return ophiuchus;
  if ((month === 12 && day >= 18) || (month === 1 && day <= 18)) return sagittarius;
  if ((month === 1 && day >= 19) || (month === 2 && day <= 15)) return capricorn;
}


// 60‑year cycle components
const animals = [
  rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig
];

const elements = [
  wood, fire, earth, metal, water
];

// Chinese New Year lookup (expand as needed)
const cnyTable = [
  { year: 1910, start: "1910-02-10" },
  { year: 1911, start: "1911-01-30" },
  { year: 1912, start: "1912-02-18" },
  { year: 1913, start: "1913-02-06" },
  { year: 1914, start: "1914-01-26" },
  { year: 1915, start: "1915-02-14" },
  { year: 1916, start: "1916-02-03" },
  { year: 1917, start: "1917-01-23" },
  { year: 1918, start: "1918-02-11" },
  { year: 1919, start: "1919-02-01" },
  { year: 1920, start: "1920-02-20" },
  { year: 1921, start: "1921-02-08" },
  { year: 1922, start: "1922-01-28" },
  { year: 1923, start: "1923-02-16" },
  { year: 1924, start: "1924-02-05" },
  { year: 1925, start: "1925-01-24" },
  { year: 1926, start: "1926-02-13" },
  { year: 1927, start: "1927-02-02" },
  { year: 1928, start: "1928-01-23" },
  { year: 1929, start: "1929-02-10" },
  { year: 1930, start: "1930-01-30" },
  { year: 1931, start: "1931-02-17" },
  { year: 1932, start: "1932-02-06" },
  { year: 1933, start: "1933-01-26" },
  { year: 1934, start: "1934-02-14" },
  { year: 1935, start: "1935-02-04" },
  { year: 1936, start: "1936-01-24" },
  { year: 1937, start: "1937-02-11" },
  { year: 1938, start: "1938-01-31" },
  { year: 1939, start: "1939-02-19" },
  { year: 1940, start: "1940-02-08" },
  { year: 1941, start: "1941-01-27" },
  { year: 1942, start: "1942-02-15" },
  { year: 1943, start: "1943-02-05" },
  { year: 1944, start: "1944-01-25" },
  { year: 1945, start: "1945-02-13" },
  { year: 1946, start: "1946-02-02" },
  { year: 1947, start: "1947-01-22" },
  { year: 1948, start: "1948-02-10" },
  { year: 1949, start: "1949-01-29" },
  { year: 1950, start: "1950-02-17" },
  { year: 1951, start: "1951-02-06" },
  { year: 1952, start: "1952-01-27" },
  { year: 1953, start: "1953-02-14" },
  { year: 1954, start: "1954-02-03" },
  { year: 1955, start: "1955-01-24" },
  { year: 1956, start: "1956-02-12" },
  { year: 1957, start: "1957-01-31" },
  { year: 1958, start: "1958-02-18" },
  { year: 1959, start: "1959-02-08" },
  { year: 1960, start: "1960-01-28" },
  { year: 1961, start: "1961-02-15" },
  { year: 1962, start: "1962-02-05" },
  { year: 1963, start: "1963-01-25" },
  { year: 1964, start: "1964-02-13" },
  { year: 1965, start: "1965-02-02" },
  { year: 1966, start: "1966-01-21" },
  { year: 1967, start: "1967-02-09" },
  { year: 1968, start: "1968-01-30" },
  { year: 1969, start: "1969-02-17" },
  { year: 1970, start: "1970-02-06" },
  { year: 1971, start: "1971-01-27" },
  { year: 1972, start: "1972-02-15" },
  { year: 1973, start: "1973-02-03" },
  { year: 1974, start: "1974-01-23" },
  { year: 1975, start: "1975-02-11" },
  { year: 1976, start: "1976-01-31" },
  { year: 1977, start: "1977-02-18" },
  { year: 1978, start: "1978-02-07" },
  { year: 1979, start: "1979-01-28" },
  { year: 1980, start: "1980-02-16" },
  { year: 1981, start: "1981-02-05" },
  { year: 1982, start: "1982-01-25" },
  { year: 1983, start: "1983-02-13" },
  { year: 1984, start: "1984-02-02" },
  { year: 1985, start: "1985-02-20" },
  { year: 1986, start: "1986-02-09" },
  { year: 1987, start: "1987-01-29" },
  { year: 1988, start: "1988-02-17" },
  { year: 1989, start: "1989-02-06" },
  { year: 1990, start: "1990-01-27" },
  { year: 1991, start: "1991-02-15" },
  { year: 1992, start: "1992-02-04" },
  { year: 1993, start: "1993-01-23" },
  { year: 1994, start: "1994-02-10" },
  { year: 1995, start: "1995-01-31" },
  { year: 1996, start: "1996-02-19" },
  { year: 1997, start: "1997-02-07" },
  { year: 1998, start: "1998-01-28" },
  { year: 1999, start: "1999-02-16" },
  { year: 2000, start: "2000-02-05" },
  { year: 2001, start: "2001-01-24" },
  { year: 2002, start: "2002-02-12" },
  { year: 2003, start: "2003-02-01" },
  { year: 2004, start: "2004-01-22" },
  { year: 2005, start: "2005-02-09" },
  { year: 2006, start: "2006-01-29" },
  { year: 2007, start: "2007-02-18" },
  { year: 2008, start: "2008-02-07" },
  { year: 2009, start: "2009-01-26" },
  { year: 2010, start: "2010-02-14" },
  { year: 2011, start: "2011-02-03" },
  { year: 2012, start: "2012-01-23" },
  { year: 2013, start: "2013-02-10" },
  { year: 2014, start: "2014-01-31" },
  { year: 2015, start: "2015-02-19" },
  { year: 2016, start: "2016-02-08" },
  { year: 2017, start: "2017-01-28" },
  { year: 2018, start: "2018-02-16" },
  { year: 2019, start: "2019-02-05" },
  { year: 2020, start: "2020-01-25" },
  { year: 2021, start: "2021-02-12" },
  { year: 2022, start: "2022-02-01" },
  { year: 2023, start: "2023-01-22" },
  { year: 2024, start: "2024-02-10" },
  { year: 2025, start: "2025-01-29" },
  { year: 2026, start: "2026-02-17" },
  { year: 2027, start: "2027-02-06" },
  { year: 2028, start: "2028-01-26" },
  { year: 2029, start: "2029-02-13" },
  { year: 2030, start: "2030-02-03" },
  { year: 2031, start: "2031-01-23" },
  { year: 2032, start: "2032-02-11" },
  { year: 2033, start: "2033-01-31" },
  { year: 2034, start: "2034-02-19" },
  { year: 2035, start: "2035-02-08" },
  { year: 2036, start: "2036-01-28" },
  { year: 2037, start: "2037-02-15" },
  { year: 2038, start: "2038-02-04" },
  { year: 2039, start: "2039-01-24" },
  { year: 2040, start: "2040-02-12" },
  { year: 2041, start: "2041-02-01" },
  { year: 2042, start: "2042-01-22" },
  { year: 2043, start: "2043-02-10" },
  { year: 2044, start: "2044-01-30" },
  { year: 2045, start: "2045-02-17" },
  { year: 2046, start: "2046-02-06" },
  { year: 2047, start: "2047-01-26" },
  { year: 2048, start: "2048-02-14" },
  { year: 2049, start: "2049-02-02" },
  { year: 2050, start: "2050-01-23" },
  { year: 2051, start: "2051-02-11" },
  { year: 2052, start: "2052-02-01" },
  { year: 2053, start: "2053-02-19" },
  { year: 2054, start: "2054-02-08" },
  { year: 2055, start: "2055-01-28" },
  { year: 2056, start: "2056-02-15" },
  { year: 2057, start: "2057-02-04" },
  { year: 2058, start: "2058-01-24" },
  { year: 2059, start: "2059-02-12" },
  { year: 2060, start: "2060-02-02" },
  { year: 2061, start: "2061-01-21" },
  { year: 2062, start: "2062-02-09" },
  { year: 2063, start: "2063-01-29" },
  { year: 2064, start: "2064-02-17" },
  { year: 2065, start: "2065-02-05" },
  { year: 2066, start: "2066-01-26" },
  { year: 2067, start: "2067-02-14" },
  { year: 2068, start: "2068-02-03" },
  { year: 2069, start: "2069-01-23" },
  { year: 2070, start: "2070-02-11" },
  { year: 2071, start: "2071-01-31" },
  { year: 2072, start: "2072-02-19" },
  { year: 2073, start: "2073-02-07" },
  { year: 2074, start: "2074-01-27" },
  { year: 2075, start: "2075-02-15" },
  { year: 2076, start: "2076-02-05" },
  { year: 2077, start: "2077-01-24" },
  { year: 2078, start: "2078-02-12" },
  { year: 2079, start: "2079-02-02" },
  { year: 2080, start: "2080-01-22" },
  { year: 2081, start: "2081-02-10" },
  { year: 2082, start: "2082-01-29" },
  { year: 2083, start: "2083-02-17" },
  { year: 2084, start: "2084-02-06" },
  { year: 2085, start: "2085-01-26" },
  { year: 2086, start: "2086-02-14" },
  { year: 2087, start: "2087-02-03" },
  { year: 2088, start: "2088-01-24" },
  { year: 2089, start: "2089-02-10" },
  { year: 2090, start: "2090-01-30" },
  { year: 2091, start: "2091-02-18" },
  { year: 2092, start: "2092-02-07" },
  { year: 2093, start: "2093-01-27" },
  { year: 2094, start: "2094-02-15" },
  { year: 2095, start: "2095-02-05" },
  { year: 2096, start: "2096-01-25" },
  { year: 2097, start: "2097-02-13" },
  { year: 2098, start: "2098-02-02" },
  { year: 2099, start: "2099-01-22" },
  { year: 2100, start: "2100-02-09" },
];

function getChineseZodiacFull(birthdate) {
  const birth = new Date(birthdate);
  const birthYear = birth.getFullYear();

  // Lookup Chinese New Year for birth year
  const thisYearCNY = cnyTable.find(e => e.year === birthYear);
  if (!thisYearCNY) {
    throw new Error(`CNY info not found for year ${birthYear}`);
  }

  const cnyDate = new Date(thisYearCNY.start);

  // Determine effective zodiac year
  const zodiacYear = birth < cnyDate
    ? birthYear - 1   // born before CNY -> previous lunar year
    : birthYear;

  // Sexagenary cycle anchor:
  // 1984 is known as a Wood Rat year (cycle start)
  const cycleBase = 1984;

  // Position in 60‑year cycle
  const cycleIndex = (zodiacYear - cycleBase + 60) % 60;

  const animal = animals[cycleIndex % 12];
  const element = elements[Math.floor((cycleIndex % 10) / 2)];

  // return `${element} ${animal}`;
  return `${element}/${animal}`;
}

// Example usages:
console.log(getChineseZodiacFull("1935-08-25"));
// console.log(getChineseZodiacFull("1988-01-30")); // "Earth Rabbit"
// console.log(getChineseZodiacFull("2000-01-20")); // "Earth Rabbit"
// console.log(getChineseZodiacFull("2000-02-10")); // "Metal Dragon"

module.exports = { getZodiacSign, getRealZodiacSign, getChineseZodiacFull };