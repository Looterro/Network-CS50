document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#all-posts').addEventListener('click', () => load_posts());

    document.querySelector('#compose-form').onsubmit = function() {
        fetch('/posting_compose', {
            method: 'POST',
            body: JSON.stringify({
                body: document.querySelector('#post-body').value,
            })
        })
        .then(response => response.json())
        .then(response => {
            fetch('')
            .then(response => response.json())
        })
    }

    load_posts()
});

function load_posts() {

    // Display the title of the page
    document.querySelector('#title').innerHTML = `All Posts`;

    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const element = document.createElement('div');
            element.innerHTML = `
                <div class="card">
                    <div class="card-title m-2">
                        <strong>${post['user']}</strong>
                        <div class="card-subtitle m-2 text-muted">
                            ${post['body']}
                            <br>
                            <small>${post['timestamp']}</small>
                        </div>
                    </div>
                </div>`;
            document.querySelector('#posts-section').append(element);
        });
    });
}