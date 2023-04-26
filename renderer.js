let prompt = '';

const renderPrompt = async (text) => {
  const prompt = document.getElementById('prompt');
  prompt.className = 'box-orange';
  prompt.innerText = text;
};

const login = async () => {
  console.log('clicked');
  const email = document.getElementById('linkedin-email').value;
  const password = document.getElementById('linkedin-password').value;

  await window.linkedIn.login(email, password);
};

const linkedInLogin = document.getElementById('linkedin');
linkedInLogin.addEventListener('click', login);

window.linkedIn.loginResponse((_event, value) => {
  renderPrompt(value);
});

const renderLoggedIn = (value) => {
  let text = value ? value : 'Login Successful! ✅';
  const loggedIn = document.getElementById('loggedIn');
  loggedIn.innerText = text;
};

window.linkedIn.loggedIn((_event, value) => {
  renderLoggedIn(value);
});

const renderMessage = (value) => {
  const message = document.getElementById('message');
  message.innerText = '';

  if (value) {
    let text = value.split('\n');

    text.forEach((line) => {
      const element = document.createElement('div');
      element.className = 'message-line';
      element.innerText = line;

      message.appendChild(element);
    });

    message.className = 'box-blue';
  } else {
    message.innerText = 'Getting new message...';
  }
};

window.linkedIn.message((_event, value) => {
  renderMessage(value);
});
