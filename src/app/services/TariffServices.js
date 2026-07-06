// TODO: implement API module so that we won't have to hardcode API urls and double awaits:
/*
  const response = await fetch("http://localhost:3000/api/tariffs");
  const tariffs = await response.json();
  // now we can use `tariffs`

  TO:

  import getTariffs from "../api/TariffAPI";
  const tariffs = await getTariffs();

*/

// TODO: the package `express` automates the JSON parsing process when using API
// use this package in the project
// import * as TariffAPI from "../api/TariffAPI";


let tariffList = [];
let tariffMap = new Map();
loadTariffs();

/**
 * INTERNAL FUNCTION NOT FOR OUTSIDE USE
 * Loads tariff array from database and caches it locally then builds the tariff map
*/
async function loadTariffs() {
    
    // tariffList = await getTariffs();
    const response =
        await fetch("http://localhost:4000/api/getTariffs");

    tariffList = await response.json();
    tariffMap.clear();
    tariffList.forEach(tariff => {
        tariffMap.set(tariff.type, tariff);
    });
}

/**
 * Function to get a copy of the tariffs.
 * NOTE: a copy is returned NOT a reference
 * 
 * @returns {Array<{ id: number, type: string, rate: number, description: string }>}
 */
export async function getTariffs() {
    if (tariffList.length === 0)
        await loadTariffs();
    return tariffList.map(t => ({ ...t }));
}

/**
 * Function to update the rate of a tariff. Reflects changes in the cache & DB.
 * Since `getTariffs` returns a COPY this means that if an update happens in another page then
 * it is not reflected in the tariffs of other pages. Pay attention to this
 * 
 * @param {number} tariff - The tariff to be updated
 * @param {number} newRate - The rate to be set to
 */
export async function updateTariffRate(tariff, newRate) {
    if (newRate < 0)
        throw new Error("Rate cannot be negative.");

    const cached = tariffList.find(
        t => t.id === tariff.id
    );
    if (!cached)
        throw new Error("Unknown tariff.");
    cached.rate = newRate;


    const response =
        await fetch(
            "http://localhost:4000/api/updateTariff",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                    id: tariff.id,
                    rate: newRate
                    }
                )
            }
        );
    const result = await response.json();
    // await TariffAPI.updateTariffRate(
    //     tariff.id,
    //     newRate
    // );

    tariffMap.set(
        cached.type,
        cached
    );
}

/**
 * Function to calculate the cost of parking based on the contextual tariffs from time ENTRY to EXIT
 * 
 * @param {Date} entry - The date of entrance
 * @param {Date} exit - The date of exit
 * @returns {number} The cost of the parking from entry to exit
 */
export function calculateCost(entry, exit) {

    if (tariffMap.size === 0)
        throw new Error("Tariffs have not been loaded.");

    const entranceFee =
        tariffMap.get("Entrance fee").rate;

    const hourly =
        tariffMap.get("Hourly").rate;

    const durationMinutes =
        (exit.getTime() - entry.getTime()) / 60000;

    const durationHours =
        Math.ceil(durationMinutes / 60);

    return entranceFee + (durationHours - 1) * hourly;
}
