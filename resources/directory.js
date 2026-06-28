function showDetails(card) {
    document.getElementById("detailPanel").innerHTML = `
        <h5>${card.dataset.name}</h5>

        <hr>

        <p><strong>Item ID:</strong> ${card.dataset.id}</p>
        <p><strong>Owner:</strong> ${card.dataset.username}</p>
        <p><strong>Quantity:</strong> ${card.dataset.quantity}</p>

        <p><strong>Description:</strong></p>
        <p>${card.dataset.description || 'No description provided.'}</p>
    `;
}