function getIntegerPrefix(num) {
    if (num > 0) {
        return '+';
    }
    return '';
}

function removeNonDigits(str) {
    return str.replace(/[A-Za-z]/g, '');
}

function getRows() {
    const dateBoxes = document.querySelectorAll('.timeline li:not(.timeline-header)');
    const numOfRows = dateBoxes.length / 7;
    const rows = {};

    // One iteration for each row
    for (let i = 0; i < numOfRows; i++) {
        // Loop for each week, 7 days
        rows[i + 1] = Array.from(dateBoxes).slice(i * 7, i * 7 + 7);
    }

    return rows;
}

function calcRowSums(rows) {
    const sums = Object.entries(rows).reduce((acc, entry) => {
        const [key, value] = entry;
        acc[key] = Array.from(value).reduce((sum, dayBox) => {
            const dayText = dayBox.querySelector('span.total:not(.ng-hide)');
            let dayTotal;
            try {
                dayTotal = Number(removeNonDigits(dayText.innerText));
                sum += dayTotal;
            } catch (error) {
                // void
            }
            return sum;
        }, 0);
        return acc;
    }, {});
    return sums;
}

function displaySums(rows, sums) {
    const isCorrectView = $('.timereport-calendar').hasClass('expanded');
    if (!isCorrectView) {
        return clearElements();
    }
    let totalFlex = 0;
    for (const row in rows) {
        const elements = rows[row];
        const rowSum = sums[row];
        const lastElement = elements[elements.length - 1];

        lastElement.style.position = 'relative';
        lastElement.style.display = 'block';

        const rowSumDiv = document.createElement('div');
        rowSumDiv.classList = 'week-summary';

        let expectedHours = 40;
        const skippedDays = Array.from(elements).reduce((acc, curr, index) => {
            // Matches days to be skipped from expected hours of the week.

            let dayVal = $(curr).find('span.total').text();

            if (
                (curr.classList.contains('holiday') ||
                    curr.classList.contains('placeholderday') ||
                    (!dayVal || dayVal === '-')) &&
                index < 5
            ) {
                acc++;
            }
            return acc;
        }, 0);

        if (skippedDays) {
            /**
             * If the week contains any non working day that is not
             * a weekend day, we want to remove this from the
             * expected 40 hours.
             */

            expectedHours = expectedHours - 8 * skippedDays;
        }

        const flexHours = rowSum - expectedHours;
        totalFlex += flexHours;
        rowSumDiv.innerHTML = `${rowSum} (${flexHours})`;

        rowSumDiv.style.position = 'absolute';
        rowSumDiv.style.left = '115%';
        rowSumDiv.style.width = '100px';
        rowSumDiv.style.top = '50%';
        rowSumDiv.style.transform = 'translateY(-50%)';
        rowSumDiv.style.color = 'black';
        rowSumDiv.style.fontWeight = '300';
        rowSumDiv.style.display = 'block';

        lastElement.appendChild(rowSumDiv);
    }
    $('.card-header .form-row:last').append(
        `<span class="total-flex-month" style="display: flex; align-items: center;"> (${getIntegerPrefix(
            totalFlex
        )}${totalFlex})</span>`
    );
}

function start() {
    console.log('Calculating hours...');

    // Remove any existing summary
    clearElements();
    // Get all rows and days
    const rows = getRows();

    // Calculate each rows sum
    const sums = calcRowSums(rows);

    // Display results of each week
    displaySums(rows, sums);

    console.log('Calculation done!');
}

function clearElements() {
    $('.week-summary').remove();
    $('span.total-flex-month').remove();
}

// setTimeout(start, 2000)

chrome.runtime.onMessage.addListener(message => {
    if (message && message.summarizeRoughly) {
        start();
    }
});

$(document).on('click', 'li[ng-repeat="day in days"]', () => {
    start();
});
