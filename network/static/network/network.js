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
        .then(response => load_posts())
    }

    load_posts()
});


function load_posts(page_number) {

    // When loading the page, display the first page of posts
    if (page_number===undefined) {page_number = 1};

    // Display the title of the page
    document.querySelector('#title').innerHTML = `All Posts`;
    
    // Fetch posts
    fetch(`/posts?page=${page_number}`)
    .then(response => response.json())
    .then(data => {

        // get posts
        let posts = data.posts;
        // get upper page limit
        let upper_page_limit = data.upper_page_limit;
        console.log(upper_page_limit)

        posts.forEach(post => {
            let element = document.createElement('div');
            element.innerHTML = `
                <div class="card">
                    <div class="card-title m-2">
                        <strong>${post['user']}</strong>
                        <div id="text-area-${post['id']}" class="card-subtitle m-2 text-muted">
                            ${post['body']}
                            <br>
                            <small id="timestamp-${post['id']}">${post['timestamp']}</small>
                        </div>
                    </div>
                </div>`;
            document.querySelector('#posts-section').append(element);

            // Hide edit button if user is not owner of the post
            username = document.querySelector('#username').innerHTML
            if ( post['user'] == username ) {
                let button = document.createElement('button');
                button.className = 'edit btn btn-secondary btn-sm';
                button.innerHTML = 'Edit';

                // If user clicks edit button, hide button and run edit post function
                button.addEventListener('click', () => {
                    edit_post(post)
                    element.removeChild(button);
                })

                element.appendChild(button);
            }
        });

        // Hide buttons if limit of pages reached
        if (page_number <= 1) {
            document.querySelector('#previous_paginator').style.display = 'none';
        } else if (page_number === upper_page_limit) {
            document.querySelector('#next_paginator').style.display = 'none';
        }

        // Hide new post submission if not on page 1

        if (page_number != 1) {
            document.querySelector('#post-form').style.display = 'none';
        } else {
            document.querySelector('#post-form').style.display = 'block';
        }

    });

    // Edit post function, pre-populate textarea with former text

    function edit_post(post) {
        console.log(post, post.id , post.body);
        let textArea = document.createElement('div');
        textArea.innerHTML = `
            <form id="edit_form_${post.id}">
                <textarea id="edit-post-body-${post.id}" class="form-control m-1">${post.body}</textarea>
                <input type="submit" class="btn btn-primary m-1" value="Save Changes">
            </form>
        `;
        console.log(textArea.innerHTML);
        let target = document.querySelector(`#text-area-${post.id}`)
        console.log(target.innerHTML, target.id);
        //Manipulate DOM to remove former body and append the form
        target.innerHTML = '';
        target.appendChild(textArea);

        //hide new post submission and only display the text area for edit
        document.querySelector('#post-form').style.display = 'none';
        
        console.log(post['id']);
        console.log(post.id);
        
        // Use PUT to change the text of a post
        document.querySelector(`#edit_form_${post.id}`).addEventListener('submit', function() {
            //fetch post and put new value and add ID
            fetch('/edit_post/' + post['id'], {
                method: 'PUT',
                body: JSON.stringify({
                    body: document.querySelector(`#edit-post-body-${post['id']}`).value,
                })
            })
            .then(response => response.json())
            .then(response => load_posts())
        });
        return false;
        //TODO ONCLICK SAVE CHANGES - Fetch? Form submission like it was? SAVE POST DOESNT WORK BECAUSE ITS ONLY GET /? METHOD INSTEAD OF PUT
    }

    // Pagination button

    let paginator = document.createElement('div');
    paginator.innerHTML = `
    <div>
        <nav>
            <ul class="pagination">
                    <li id="previous_paginator" class="page-item"><a class="page-link">&laquo; previous</a></li>
                    <li id="next_paginator" class="page-item"><a class="page-link"">next &raquo;</a></li>
            </ul>
        </nav>
    </div>
    `
    document.querySelector('#pagination').append(paginator);

    // Onclick change page of posts

    document.querySelector('#previous_paginator').onclick = function() {
        document.querySelector('#posts-section').innerHTML = '';
        document.querySelector('#pagination').innerHTML = '';
        page_number --;
        load_posts(page_number)
    }
    document.querySelector('#next_paginator').onclick = function() {
        document.querySelector('#posts-section').innerHTML = '';
        document.querySelector('#pagination').innerHTML = '';
        page_number ++;
        load_posts(page_number)
    }

}