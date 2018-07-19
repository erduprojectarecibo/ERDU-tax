document.addEventListener('DOMContentLoaded', () => {

  //initializing the modal
  M.Modal.init(document.getElementById('modal'), {
    onCloseEnd: () => {
      document.getElementById('table-body').innerHTML = '';
      document.getElementById('calculate_btn').disabled = false;
    }
  });

  // modal close event
  document.getElementById('close-modal').addEventListener('click', () => {
    let modal = M.Modal.getInstance(document.getElementById('modal'));
    modal.close();
  });

  class Contribution {
    constructor(title, input, bracketArr, percentArr, amountArr) {
      this.title = title;
      this.input = input;
      this.brackets = bracketArr;
      this.percentages = percentArr;
      this.amounts = amountArr;
      this.brackets.push(Infinity);
      if (title.includes('USA') || title.includes('US')) {
        this.brackets.unshift(0);
        this.percentages.unshift(0);
        this.amounts.unshift(0);
      }
    }

    get tax() {
      for (let i = 0; i < this.brackets.length; i++) {
        if (this.input <= this.brackets[i])
          return this.amounts[i] + this.percentages[i] * (this.input - this.brackets[i == 0 ? i : i - 1]);
      }
    }

    get effectiveRate() {
      return this.tax / this.input * 100;
    }
  }

  // adds row to result table
  function addRow(obj) {
    let table = document.getElementById('result_table').getElementsByTagName('tbody')[0];
    let row = table.insertRow(table.rows.length);

    let cell = row.insertCell(0)
    let text = document.createTextNode(obj.title);
    cell.appendChild(text);

    cell = row.insertCell(1)
    text = document.createTextNode(currencyFormat(obj.input));
    cell.appendChild(text);

    cell = row.insertCell(2)
    text = document.createTextNode(currencyFormat(obj.tax));
    cell.appendChild(text);

    cell = row.insertCell(3)
    text = document.createTextNode(obj.effectiveRate.toFixed(1) + "%");
    cell.appendChild(text);

    function currencyFormat(num) {
      return new Intl.NumberFormat("en-US", {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(num)
    }
  }

  var inputEl = document.getElementById('ingreso_neto'); //form input

  // shows toast
  function error(msg) {
    inputEl.classList.add('invalid');
    M.toast({
      html: msg,
      displayLength: 4000
    })
  }


  document.getElementById('tax-form').addEventListener('submit', () => {
    event.preventDefault(); //prevents page from reloading on submit
    inputEl.classList.remove('invalid');

    var insc = inputEl.value; //ingreso neto sujeto a contribuciones
    if (insc == '') {
      error('Input required');
      return;
    }
    if (insc <= 0) {
      error('Input must be greater than 0');
      return;
    }
    document.getElementById('calculate_btn').disabled = true;

    let progressBar = document.getElementById('progress-bar');
    progressBar.classList.remove('hide');

    let title = 'PR Tax 2017';
    let brackets = [9000, 25000, 41500, 61500];
    let percentages = [0, 0.07, 0.14, 0.25, 0.33];
    let amounts = [0, 0, 1120, 3430, 8430];
    let PR17 = new Contribution(title, insc, brackets, percentages, amounts);

    title = 'PR Proposed Tax Reform 2018';
    brackets = [12500, 21000, 45000, 58000];
    percentages = [0, 0.009, 0.09, 0.19, 0.31];
    amounts = [0, 0, 76, 2236, 4706];
    let PR18 = new Contribution(title, insc, brackets, percentages, amounts);

    // title must include 'USA' or 'US' for US Taxes to work
    title = 'USA Tax 2017';
    brackets = [9325, 37950, 91900, 191650, 416700, 418400];
    percentages = [0.1, 0.15, 0.25, 0.28, 0.33, 0.35, 0.396];
    amounts = [0, 932.5, 5226.25, 18713.75, 46643.75, 120910.25, 121505.25];
    let US17 = new Contribution(title, insc, brackets, percentages, amounts);

    title = 'USA Tax Reform 2018';
    brackets = [9525, 38700, 82500, 157500, 200000, 500000];
    percentages = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
    amounts = [0, 952.5, 4453.5, 14089.5, 32089.5, 45689.5, 150689.5];
    let US18 = new Contribution(title, insc, brackets, percentages, amounts);

    addRow(PR17);
    addRow(PR18);
    addRow(US17);
    addRow(US18);

    setTimeout(() => {
      progressBar.classList.add('hide');
      let modal = M.Modal.getInstance(document.getElementById('modal'));
      modal.open();
    }, 2000)

  });
});
