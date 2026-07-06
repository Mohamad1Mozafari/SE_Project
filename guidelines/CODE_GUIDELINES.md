# Coding guidelines under collaborative work

This is a short and to the point file which goes over certain collaborative contracts set up for this project.

## Documenting Services, APIs, and Functions

Our current system is complicated. There are many multi-purpose elements involved but the most important part is the **backend**. It is **CRUCIAL** to comment your services, APIs, and CORE functions so that as the rest of the team uses it certain issues won't arise like:

- Long and tedious pieces of code that no one reads or understands!
- Miscommunication of what the service offers
- Miscommunication of how to use and what to expect of the service

You are entitled to comment your code however you please as long as it sends the message. One such way is using **JSDoc comments**, the de-facto standard in javascript.
General format:

  ```javascript
  /**
  * Adds two numbers.
  *
  * @param {number} a - The first addend.
  * @param {number} b - The second addend.
  * @returns {number} The sum of `a` and `b`.
  * @throws {TypeError} If either argument is not a number.
  */
  function add(a, b) {
    if (typeof a !== "number" || typeof b !== "number") throw new TypeError("Numbers only");
    return a + b;
  }
  ```

Example in our codebase:

  ```javascript
  /**
  * Function to update the rate of a tariff. Reflects changes in the cache & DB.
  * Since `getTariffs` returns a COPY this means that if an update happens in another page then
  * it is not reflected in the tariffs of other pages. Pay attention to this
  * 
  * @param {number} tariff - The tariff to be updated
  * @param {number} newRate - The rate to be set to
  */
  export async function updateTariffRate(tariff, newRate) {...}
  ```

## Marking each other on respective aspects & responsibilites

A software system is comprised of many areas. Even though in this project each of us will work on all aspects, it has been decided that some of us also specialize in certain areas.

**To direct other team member's attention to a piece of code, write a comment starting with -> then the person's name in uppercase.**
Example:

  ```javascript
  // ->AHMAD: need to implement DB API for getting tariffs
  async function loadTariffs() {
    
    tariffList = await TariffAPI.getTariffs();

    tariffMap.clear();

    tariffList.forEach(tariff => {
        tariffMap.set(tariff.type, tariff);
    });
  }
  ```

This way you can do a global search within the project space and find out the places that require your attention immediately.

*NOTE: to do global search on VScode, press the magnifier button on the navigation menu on the left OR press (Ctrl + Shift + F).*
Example:

![How to do global search in vscode](/images/guidelines/attention_comments.png)

Optionally we can also write who directs who in the comment:
```javascript
// OMID->AHMAD: need to implement DB API for getting tariffs
```

## Marking fatal erros & bugs

If a certain part of the program is susceptible to a bug, **we can write a comment which starts with BUG**.
Example:

```javascript
// BUG: value for rate accepts less than zero
```

If there is a fatal error in the project, **we mark it by writing a comment which starts with FATAL**.
Example:
```javascript
/* FATAL: server.js crashes on every request. The output indicates:
'''
can not connect to the Database! Failed to connect to .:1433 - getaddrinfo EAI_AGAIN .
'''
*/
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
```

## Marking items to be done or checked later

Many changes need to be applied to the software. Outside of the designated Backlogs and the Gantt Chart, **we can specify miniscule tasks within the code that need our attention by writing a comment which starts with TODO**.
Example:

  ```javascript
  // TODO: implement multiple tariff updates like: `updateMultTariffRates(...pairs)`
  export async function updateTariffRate(tariff, newRate) {...}
  ```

If the changes are relatively major you can also write them in the main branch's [TODO](/TODO)
