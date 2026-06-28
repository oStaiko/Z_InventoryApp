function showDetails(card) {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const username = card.dataset.username;
    const quantity = card.dataset.quantity;
    const description = card.dataset.description || '';

    document.getElementById("detailPanel").innerHTML = `
        <h5 id="detail-name">${name}</h5>
        <hr>
        <p><strong>Item ID:</strong> ${id}</p>
        <p><strong>Owner:</strong> <span id="detail-username">${username}</span></p>
        <p><strong>Quantity:</strong> <span id="detail-quantity">${quantity}</span></p>
        <p><strong>Description:</strong></p>
        <p id="detail-description">${description || 'No description provided.'}</p>
        <div style="display:flex; gap:8px; margin-top:12px;">
            <button id="btn-edit" onclick="enableEdit('${id}', '${name}', '${quantity}', \`${description}\`)">Edit</button>
            <button id="btn-delete" onclick="deleteItem('${id}')">Delete</button>
        </div>
    `;
}

function enableEdit(id, name, quantity, description) {
    document.querySelector('#detail-name').innerHTML =
        `<input id="edit-name" value="${name}" maxlength="20"/>`;
    document.querySelector('#detail-quantity').innerHTML =
        `<input id="edit-quantity" type="number" value="${quantity}" maxlength="10"/>`;
    document.querySelector('#detail-description').innerHTML =
        `<textarea id="edit-description" maxlength="500">${description}</textarea>`;

    document.getElementById('btn-edit').textContent = 'Save';
    document.getElementById('btn-edit').onclick = () => saveEdit(id);
}

const sanitize = {
    name(raw) {
        return raw
        .trim()                          // remove leading/trailing whitespace
        .replace(/\s+/g, ' ')            // collapse multiple spaces to one
        .replace(/[^a-zA-Z0-9 \-]/g, '') // strip non-alphanumeric, non-space, non-hyphen
        .slice(0, 20);                   // enforce max length
    },

    quantity(raw) {
        const n = Math.trunc(Number(raw)); // parse and drop any decimal
        if (Number.isFinite(n)) return n; else return 0; // guard against NaN / Infinity
    },

    description(raw) {
        return raw
        .replace(/"/g, "'")              // swap double quotes for single quotes
        .replace(/['\\;%\-\-]/g, c =>    // escape SQL-risky characters
            ({ "'": "''", '\\': '\\\\', ';': '', '%': '' }[c] ?? c))
        .slice(0, 500);                  // enforce max length
    },
};

async function saveEdit(id) {

    const payload = {
        name:        sanitize.name(document.getElementById('edit-name').value),
        quantity:    sanitize.quantity(document.getElementById('edit-quantity').value),
        description: sanitize.description(document.getElementById('edit-description').value),
    };

    try {
        console.log('Attempting to patch '+ id)
        const res = await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
        location.reload();
    } catch (err) {
        alert(`Failed to save changes: ${err.message}`);
    }
}

async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;

    try {
        const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
        location.reload();
    } catch (err) {
        alert(`Failed to delete item: ${err.message}`);
    }
}

function createItem() {
    document.getElementById("detailPanel").innerHTML = `
        <h5>New Item</h5>
        <hr>
        <p><strong>Name<span style="color: tomato;">*</span>:</strong></p>
        <p><input id="create-name" maxlength="20" required/></p>
        <p><strong>Quantity<span style="color: tomato;">*</span>:</strong></p>
        <p><input id="create-quantity" maxlength="10" type="number" value="0" required/></p>
        <p><strong>Description:</strong></p>
        <p><textarea id="create-description" maxlength="500"></textarea></p>
        <div style="display:flex; gap:8px; margin-top:12px;">
            <button onclick="saveNewItem()">Save</button>
            <button onclick="resetDetailPanel()">Cancel</button>
        </div>
    `;
}

async function saveNewItem() {
    const payload = {
        name:        sanitize.name(document.getElementById('create-name').value),
        quantity:    sanitize.quantity(document.getElementById('create-quantity').value),
        description: sanitize.description(document.getElementById('create-description').value),
    };
    
    if (payload.name=="")
    {
        return alert('Name field is required')
    }
    else if (payload.quantity)

    try {
        const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`POST failed: ${res.status}`);
        location.reload();
    } catch (err) {
        alert(`Failed to create item: ${err.message}`);
    }
}

function resetDetailPanel() {
    document.getElementById("detailPanel").innerHTML = `
        <p class="text-muted">
            Click on a card for more information.
        </p>
    `;
}