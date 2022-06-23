(function() {

    var form = document.getElementById("loginform");
    form.style = "";

    var element = document.getElementById("login_btn");
    element.onclick = function(event) {
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        var loginBody = {
            email: email,
            password: password
        };

        fetch('./api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginBody)
            })
            .then(res => {
                fetch('./api/get-user-specialty.php?email=' + email).then(response =>
                    response.json().then(data => ({
                        data: data,
                        status: response.status
                    })).then(res => {
                        document.cookie = "currentlyLoggedInUserSpeciality=" + res.data.specialty;
                        window.location.href = './index.html';
                    }));
            })
            .catch(err => {
                console.error(err);
            });
    }
})();