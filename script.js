// ===== DATA =====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart = null;

// ===== SET TODAY'S DATE BY DEFAULT =====
document.getElementById('date').valueAsDate = new Date();

// ===== ADD TRANSACTION =====
function addTransaction() {
  const desc     = document.getElementById('desc').value.trim();
  const amount   = parseFloat(document.getElementById('amount').value);
  const type     = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const date     = document.getElementById('date').value;

  // Validation
  if (!desc) {
    alert('Please enter a description.');
    return;
  }
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }
  if (!date) {
    alert('Please select a date.');
    return;
  }

  const transaction = {
    id: Date.now(),
    desc,
    amount,
    type,
    category,
    date
  };

  transactions.push(transaction);
  saveToStorage();
  render();
  clearForm();
}

// ===== DELETE TRANSACTION =====
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  render();
}

// ===== CLEAR ALL =====
function clearAll() {
  if (transactions.length === 0) return;
  if (confirm('Are you sure you want to delete all transactions?')) {
    transactions = [];
    saveToStorage();
    render();
  }
}

// ===== SAVE TO LOCAL STORAGE =====
function saveToStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ===== CLEAR FORM =====
function clearForm() {
  document.getElementById('desc').value   = '';
  document.getElementById('amount').value = '';
  document.getElementById('type').value   = 'expense';
  document.getElementById('category').value = 'Food';
  document.getElementById('date').valueAsDate = new Date();
}

// ===== RENDER EVERYTHING =====
function render() {
  renderSummary();
  renderList();
  renderChart();
}

// ===== RENDER SUMMARY CARDS =====
function renderSummary() {
  const income  = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  document.getElementById('total-income').textContent  = '₹' + income.toLocaleString('en-IN');
  document.getElementById('total-expense').textContent = '₹' + expense.toLocaleString('en-IN');

  const balEl = document.getElementById('balance');
  balEl.textContent = '₹' + Math.abs(balance).toLocaleString('en-IN');
  balEl.style.color = balance >= 0 ? '#3b82f6' : '#ef4444';
}

// ===== RENDER TRANSACTION LIST =====
function renderList() {
  const ul = document.getElementById('transaction-list');
  ul.innerHTML = '';

  if (transactions.length === 0) {
    ul.innerHTML = '<li class="empty-msg">No transactions yet. Add one above!</li>';
    return;
  }

  // Sort by date (newest first)
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(t => {
    const li = document.createElement('li');
    li.className = `transaction-item ${t.type}`;
    li.innerHTML = `
      <div class="txn-left">
        <span class="txn-desc">${t.category.split(' ')[0]} ${t.desc}</span>
        <span class="txn-meta">${formatDate(t.date)} • ${t.category}</span>
      </div>
      <div class="txn-right">
        <span class="txn-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}
        </span>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Delete">✕</button>
      </div>
    `;
    ul.appendChild(li);
  });
}

// ===== RENDER CHART =====
function renderChart() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const noDataMsg = document.getElementById('no-data-msg');

  if (expenses.length === 0) {
    noDataMsg.style.display = 'block';
    if (chart) {
      chart.destroy();
      chart = null;
    }
    return;
  }

  noDataMsg.style.display = 'none';

  // Group by category
  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data   = Object.values(categoryTotals);

  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  if (chart) chart.destroy();

  const ctx = document.getElementById('expenseChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ₹${context.parsed.toLocaleString('en-IN')}`;
            }
          }
        }
      }
    }
  });
}

// ===== FORMAT DATE =====
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ===== INITIAL RENDER =====
render();
