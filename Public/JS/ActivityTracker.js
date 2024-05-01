// Ved indlæsning af siden
document.addEventListener('DOMContentLoaded', async () => {
    const categorySelect = document.getElementById('activity-options');
    if (!categorySelect) return;

    try {
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        if (!categoriesResponse.ok) {
            throw new Error(`HTTP error! Status: ${categoriesResponse.status}`);
        }
        const categories = await categoriesResponse.json();        
        categories.forEach(category => {
          const option = new Option(category.Kategori, category.Kategori);
          categorySelect.add(option);
        });
    } catch (error) {
        console.error('Failed to fetch categories:', error.message);
        // Vis evt. en fejlmeddelelse på siden
    }
});

// Når en kategori er valgt
document.getElementById('activity-options')?.addEventListener('change', async (event) => {
    const activitySelect = document.getElementById('specific-activity-options');
    if (!activitySelect) return;

    try {
        const category = event.target.value;
        const activitiesResponse = await fetch(`http://localhost:3000/api/activities/${category}`);
        if (!activitiesResponse.ok) {
            throw new Error(`HTTP error! Status: ${activitiesResponse.status}`);
        }
        const activities = await activitiesResponse.json();
        activitySelect.innerHTML = ''; // Ryd tidligere aktiviteter
        activitySelect.appendChild(new Option("Select Specific Activity", "")); // Gør det muligt at vælge en aktivitet, istedet for at man bliver tilgivet en til at starte med. 
        activities.forEach(activity => {
          const option = new Option(activity.AktivitetsNavn, activity.AktivitetsNavn);
          option.dataset.kcalPerTime = activity.KcalPerTime; // Gem kaloriedata som data-attribute
          activitySelect.add(option);
        });
    } catch (error) {
        console.error('Failed to fetch activities:', error.message);
        // Vis evt. en fejlmeddelelse på siden
    }
});

// Når en aktivitet er valgt
document.getElementById('specific-activity-options')?.addEventListener('change', (event) => {
    const kcalPerTime = event.target.options[event.target.selectedIndex].dataset.kcalPerTime;
    const caloriesBurnedDisplay = document.getElementById('calories-burned');
    if (caloriesBurnedDisplay) caloriesBurnedDisplay.textContent = kcalPerTime;
});




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
