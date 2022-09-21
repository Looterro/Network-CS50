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
        .then(result => {
            //print result
            console.log(result);
        })
        .then(response => {
            fetch('')
            .then(response => response.json())
        })
    }

});

function load_posts() {
    return undefined
}