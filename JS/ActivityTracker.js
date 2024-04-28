// Funktion til at beregne basalstofskiftet for kvinder
function calculateBasalMetabolismFemale(age, weight, height) {
  let basalMetabolism;

  if (age < 3) {
      basalMetabolism = (0.068 * weight) + (4.28 * height) - 1.73;
  } else if (age >= 4 && age <= 10) {
      basalMetabolism = (0.071 * weight) + (0.68 * height) + 1.55;
  } else if (age >= 11 && age <= 18) {
      basalMetabolism = (0.035 * weight) + (1.95 * height) + 0.84;
  } else if (age >= 19 && age <= 30) {
      basalMetabolism = (0.0615 * weight) + 2.08;
  } else if (age >= 31 && age <= 60) {
      basalMetabolism = (0.0364 * weight) + 3.47;
  } else if (age >= 61 && age <= 75) {
      basalMetabolism = (0.0386 * weight) + 2.88;
  } else {
      basalMetabolism = (0.041 * weight) + 2.61;
  }

  return basalMetabolism;
}

// Funktion til at beregne basalstofskiftet for mænd
function calculateBasalMetabolismMale(age, weight, height) {
  let basalMetabolism;

  if (age < 3) {
      basalMetabolism = (0.0007 * weight) + 6.35 - 2.58;
  } else if (age >= 4 && age <= 10) {
      basalMetabolism = (0.082 * weight) + (0.55 * height) + 1.74;
  } else if (age >= 11 && age <= 18) {
      basalMetabolism = (0.068 * weight) + (0.57 * height) + 2.16;
  } else if (age >= 19 && age <= 30) {
      basalMetabolism = (0.064 * weight) + 2.84;
  } else if (age >= 31 && age <= 60) {
      basalMetabolism = (0.0485 * weight) + 3.67;
  } else if (age >= 61 && age <= 75) {
      basalMetabolism = (0.0499 * weight) + 2.93;
  } else {
      basalMetabolism = (0.035 * weight) + 3.43;
  }

  return basalMetabolism;
}


let basalMetabolism;

if (isMale) {
  basalMetabolism = calculateBasalMetabolismMale(age, weight, height);
} else {
  basalMetabolism = calculateBasalMetabolismFemale(age, weight, height);
}

console.log('Basalstofskifte:', basalMetabolism.toFixed(2), 'MJ');
