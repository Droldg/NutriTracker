function showActivityContainer() {
        var activityOptions = document.getElementById("activity-options");
        var selectedActivityContainer = document.getElementById("selected-activity-container");
        var selectedActivity = document.getElementById("selected-activity");

        selectedActivityContainer.style.display = "block";
        selectedActivity.textContent = activityOptions.value;

        if (activityOptions.value === "almindelige-hverdagsaktiviteter") {
            selectedActivity.innerHTML = `
                <select name="specific-activity-options" id="specific-activity-options">
                    <option value="" disabled selected>Vælg en aktivitet</option>
                    <option value="almindelig-gang">Almindelig gang</option>
                    <option value="gang-ned-af-trapper">Gang ned af trapper</option>
                    <option value="gang-op-af-trapper">Gang op af trapper</option>
                    <option value="slå-græs-med-manuel-græsslåmaskine">Slå græs med manuel græsslåmaskine</option>
                    <option value="lave-mad-og-redde-senge">Lave mad og redde senge</option>
                    <option value="luge-ukrudt">Luge ukrudt</option>
                    <option value="rydde-sne">Rydde sne</option>
                    <option value="læse-eller-se-tv">Læse eller se TV</option>
                    <option value="stå-oprejst">Stå oprejst</option>
                    <option value="cykling-i-roligt-tempo">Cykling i roligt tempo</option>
                    <option value="tørre-støv-af">Tørre støv af</option>
                    <option value="vaske-gulv">Vaske gulv</option>
                    <option value="pudse-vinduer">Pudse vinduer</option>
                </select>
            `; 
        } else if (activityOptions.value === "sportsaktiviteter") {
            selectedActivity.innerHTML = `
                <select name="specific-activity-options" id="specific-activity-options">
                    <option value="" disabled selected>Vælg en aktivitet</option>
                    <option value="cardio">Cardio</option>
                    <option value="hård-styrketræning">Hård styrketræning</option>
                    <option value="badminton">Badminton</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="bordtennis">Bordtennis</option>
                    <option value="dans-i-højt-tempo">Dans i højt tempo</option>
                    <option value="dans-i-moderat-tempo">Dans i moderat tempo</option>
                    <option value="fodbold">Fodbold</option>
                    <option value="rask-gang">Rask gang</option>
                    <option value="golf">Golf</option>
                    <option value="håndbold">Håndbold</option>
                    <option value="squash">Squash</option>
                    <option value="jogging">Jogging</option>
                    <option value="langrend">Langrend</option>
                    <option value="løb-i-moderat-tempo">Løb i moderat tempo</option>
                    <option value="løb-i-hurtigt-tempo">Løb i hurtigt tempo</option>
                    <option value="ridning">Ridning</option>
                    <option value="skøjteløb">Skøjteløb</option>
                    <option value="svømning">Svømning</option>
                    <option value="cykling-i-højt-tempo">Cykling i højt tempo</option>
                </select>
            `;
        } else if (activityOptions.value === "forskellige-typer-arbejde") {
            selectedActivity.innerHTML = `
                <select name="specific-activity-options" id="specific-activity-options">
                    <option value="" disabled selected>Vælg en aktivitet</option>
                    <option value="bilreparation">Bilreparation</option>
                    <option value="gravearbejde">Gravearbejde</option>
                    <option value="landbrugsarbejde">Landbrugsarbejde</option>
                    <option value="let-kontorarbejde">Let kontorarbejde</option>
                    <option value="male-hus">Male hus</option>
                    <option value="murerarbejde">Murerarbejde</option>
                    <option value="hugge-og-slæbe-på-brænde">Hugge og slæbe på brænde</option>
                </select>
            `;
        }
    }







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
