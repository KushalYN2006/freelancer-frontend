// Runs on page load — fetches projects from Java → MySQL
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const projects = await fetchProjects();    // calls Java API
        const container = document.getElementById('projects-list');

        if (projects.length === 0) {
            container.innerHTML = '<p>No open projects yet.</p>';
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-badge">${project.status}</div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-meta">
                    <span>💰 $${project.budget}</span>
                    <span>📅 ${project.deadline}</span>
                </div>
                <button onclick="window.location.href='bid.html?id=${project.projectId}'"
                        class="btn-primary">
                    Place Bid
                </button>
            </div>
        `).join('');

    } catch (err) {
        console.error('Failed to load projects:', err);
        document.getElementById('projects-list').innerHTML =
            '<p style="color:red">Error loading projects. Is the Java server running?</p>';
    }
});