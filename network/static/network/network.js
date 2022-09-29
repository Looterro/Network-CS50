document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#all-posts').addEventListener('click', () => load_posts());
    document.querySelector('#username').addEventListener('click', () => load_user(document.querySelector('#username').innerHTML));

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

    load_posts('all_posts')
});

function load_user (user) {


    console.log(user);

    //Hide previous posts from other section
    document.querySelector('#posts-section').innerHTML = '';
    document.querySelector('#pagination').innerHTML = '';
    document.querySelector('#userview').innerHTML = '';

    //Create new title of the page with given username
    document.querySelector('#title').innerHTML = `${user}`;

    let user_information = document.createElement('div');
    user_information.id = `${user}-profile`

    //Check if user is on their own profile page
    if (user != document.querySelector('#username').innerHTML) {
        follow_button = `<button id="follow-toggle-${user}" class="follow btn btn-info">Follow</button>`;
    } else {
        follow_button ='';
    }

    let followed_counter = 0;
    let following_counter = 0;

    fetch('/load_users/' + user)
    .then(response => response.json())
    .then(data => {
        let users = data.user
        console.log(users)
        console.log(users.username)
        users.forEach(profile => {

            let testButton = document.createElement('button');
            testButton.className = "btn btn-primary";
            testButton.innerHTML = "ClickME";
            document.querySelector(`#${user}-profile`).append(testButton);

            let followedCounter = 0;
            let followingCounter = 0;

            let testcounter_div = document.createElement('div');
            testcounter_div.style.display = "inline-block";
            testcounter_div.id = `${user}-counter`;
            testcounter_div.innerHTML = `Followers: ${followedCounter} | Following: ${followingCounter}`;
            document.querySelector(`#${user}-profile`).append(testcounter_div);

            console.log(profile.username)
            console.log(profile)
            console.log(profile.followers)
            console.log(profile.followers.length)
            console.log(profile.following)
            if (profile.followers.length > 0) {
                followed_counter = profile.followers.length;
            } else if (profile.following.length > 0) {
                following_counter = profile.following.length;
            }
        })
    })

    user_information.innerHTML = `
    <hr>
    ${follow_button} <div class="followers-counter">Amount of followers: ${followed_counter} | Following: ${following_counter}</div>
    <hr>`

    document.querySelector('#userview').append(user_information)

    fetch('/follow_status', {
        method: 'PUT',
        body: JSON.stringify({
            username: user
        })
    })
    .then(response => response.json())
    .then(data => {
        let followed = data['followed']

        if (followed === true){
            follow_button = '<button class="follow btn btn-secondary">Unfollow</button>';
        }

        document.querySelector(`#follow-toggle-${user}`).onclick = () => {
            console.log(data);
            console.log(followed);
            console.log(user);
            follow(user);
        }
    })

    function follow(user) {
        
        fetch('follow', {
            method: 'PUT',
            body: JSON.stringify({
                username: user
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            let followed = data['followed']
            console.log(followed)
            let followers = data['followers']

            if (followed === false ) {
                follow_button = `<button id="follow-toggle-${user}" class="follow btn btn-info">Follow</button>`; 
            }

            followed_counter = followers
            if (data.followers > 0) {
                followed_counter = data.followers;
            }
        })
    }

    //Load posts with given username
    load_posts(user)
}


function load_posts(posts_type, page_number) {

    // When loading the page, display the first page of posts
    if (page_number===undefined) {page_number = 1};

    // Display the title of the page
    if (posts_type == "all_posts") {
        document.querySelector('#title').innerHTML = "All Posts";
    } else {
        document.querySelector('#title').innerHTML = `${posts_type}`;
    }
    
    // Fetch posts
    fetch(`/posts/${posts_type}?page=${page_number}`)
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
                        <button class="userview-link"><strong id='username-${post.id}'>${post['user']}</strong></button>
                        <div id="text-area-${post['id']}" class="card-subtitle m-2 text-muted">
                            ${post['body']}
                            <br>
                            <small id="timestamp-${post['id']}">${post['timestamp']}</small>
                        </div>
                    </div>
                </div>`;
            //Append the element
            document.querySelector('#posts-section').append(element);

            // Hide edit button if user is not owner of the post
            let username = document.querySelector('#username').innerHTML;
            if ( post['user'] == username ) {
                let button = document.createElement('button');
                button.className = 'edit btn btn-secondary btn-sm';
                button.innerHTML = 'Edit';
                
                // If user clicks edit button, hide button and run edit post function
                button.addEventListener('click', () => {
                    edit_post(post)
                    element.removeChild(button);
                    element.removeChild(like_toggle);
                    element.removeChild(counter_div);
                })

                element.appendChild(button);
            }

            // Create link to user page on each post

            document.querySelector(`#username-${post.id}`).addEventListener('click', () => load_user(post['user']));
            
            // Create the like button and counter and then append to post

            let like_toggle = document.createElement('div');
            like_toggle.innerHTML = '&#9825;';
            like_toggle.className = 'btn like';

            let like_counter = 0;
            if (post.likes.length > 0) {
                like_counter = post.likes.length;
            }

            let counter_div = document.createElement('div');
            counter_div.innerHTML = `${like_counter}`;
            counter_div.style.display = 'inline-block';

            element.appendChild(like_toggle);
            element.appendChild(counter_div);

            //Check if post is liked by user and call like function
            fetch('/like_status', {
                method: 'PUT',
                body: JSON.stringify({
                    id: post.id
                })
            })
            .then(response => response.json())
            .then(data => {

                let liked = data['liked']

                //If post already liked, change heart to filled and red
                if (liked === true ){
                    like_toggle.innerHTML = '&#9829'
                    like_toggle.style.color = 'red';
                }

                // Onclick change like button
                like_toggle.addEventListener('click', () => {
                    console.log(data);
                    console.log(liked)
                    like_post(post.id)
            })
            })

            function like_post(post_id) {
                
                fetch('like', {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: post_id
                    })
                })
                .then(response => response.json())
                .then(data => {
                    
                    console.log(data)
                    let liked = data['liked']
                    console.log(liked)
                    let likes = data['likes']

                    if (liked === false) {
                        like_toggle.innerHTML = '&#9825; '
                        like_toggle.style.color = 'black';
                    } else {
                        like_toggle.innerHTML = '&#9829'
                        like_toggle.style.color = 'red';
                    }
                    // Update the like counter without reloading the page
                    counter_div.innerHTML = likes
                })

            }

        });

        // Check if there is only one page, add pagination buttons
        if (upper_page_limit !== 1) {

            // Make sure that pagination div is displayed
            document.querySelector('#pagination').style.display = 'block';

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
                load_posts(posts_type, page_number)
            }
            document.querySelector('#next_paginator').onclick = function() {
                document.querySelector('#posts-section').innerHTML = '';
                document.querySelector('#pagination').innerHTML = '';
                page_number ++;
                load_posts(posts_type, page_number)
            }

            // Hide buttons if limit of pages reached
            if (page_number <= 1) {
                document.querySelector('#previous_paginator').style.display = 'none';
            } else if (page_number == upper_page_limit) {
                document.querySelector('#next_paginator').style.display = 'none';
            }
            
        } else {
            //If there is only one page, dont display the pagination div after posts
            document.querySelector('#pagination').style.display = 'none';
        }
        
        // Hide new post submission if not on page 1 or not in all_posts section

        if (page_number != 1 || posts_type != "all_posts") {
            document.querySelector('#post-form').style.display = 'none';
        } else {
            document.querySelector('#post-form').style.display = 'block';
        }

    });

    // Edit post function, pre-populate textarea with former text

    function edit_post(post) {
        console.log(post, post.id , post.body);

        console.log(post.body.slice(-23));
        console.log(post.body.split(''));

        //Remove "[Edited]" information for another edit
        if (post.body.slice(-24) == ' <small>[Edited]</small>') {
            let split = post.body.split('');
            split.splice(-24);
            post.body = split.join('');
        }


        //Create textarea for edit input and pre-populate with former data
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
                    body: document.querySelector(`#edit-post-body-${post['id']}`).value + ' <small>[Edited]</small>',
                })
            })
            .then(response => response.json())
        });
    }

}