# TokenProvider

The MERN-template utilizes React's `useContext()` hook to share the auth-server's access token, effectively globally. Here is a quick rundown of how it works.

# Enabling TokenProvider

To enable the TokenProvider component, wrap your App component with it, like so:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import App from './pages/app';
import TokenProvider from './pages/utilities/token-provider';

ReactDOM.render(
	<TokenProvider>
		<App />
	</TokenProvider>,
	document.querySelector('#root')
);
```

# Accessing The Access Token

To access the access token from your app, you simply use the `useContext` hook, like so:

```jsx
import React, { useContext } from 'react';
import { TokenContext } from '../utilities/token-provider';

const Component = props => {
	//context
	const authTokens = useContext(TokenContext);

	//use the access token
	console.log(authTokens.accessToken);

	return <div />;
};

export default Component;
```

# Most Useful Features Provided

The most useful features provided by TokenProvider are:

* `tokenFetch()`, which wraps the `fetch()` API to ensure that your access token is valid
* `tokenCallback()`, which passes the accessToken as a parameter to any function passed into it
* `getPayload()`, which returns the payload of the accessToken (including as "email", "username", "admin", and "mod")
* `accessToken`, this will be falsy if the user is not logged in

