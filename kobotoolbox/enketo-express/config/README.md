Configuration
==============

All configuration is done in config/config.json. **Leave config/default-config.json unchanged.** 
Recommended way to start is to copy config/default-config.json and rename it to config/config.json (`cp config/default-config.json config/config.json`).

The **bold items are required**. Others are optional.

#### app name 
Just use `"Enketo for [your service name]"`. It is not used much in the app.

#### port
The port on which your app is run, e.g. `"8005"`. Any unique assignable port will do. Generally you can leave this alone as you'll use a reverse proxy to map the public port.

#### offline enabled
Enable or disable offline functionality. Is either `false` or `true`.

#### linked form and data server
* name: The (short) name of your form server. This name will be used in various places in the app to provide feedback to the user. E.g. "ODK Aggregate", "KoboToolbox", "MyCoolService"
* **server url: Initially this can be an empty string (`""`). This will allow any server that knows the secret api key to use your Enketo installation. If you'd like to lock the usage down to a particular form server for optimimum security, fill in your domain without the protocol. E.g. "kobotoolbox.org". Depending on your form server, you can even specify that the server can only be used for a particular account e.g. "myformhub.org/janedoe". You can also use a regular expression string e.g. "opendatakit\\.appspot\\.com" (it will be used to create a regular expression with RegExp()).**
* **api key: The api key that will be used to authenticate any API usage, e.g. to launch a form when the 'webform' button is clicked. This is the key (sometimes called _token_) you need to copy in your form server.**
* authentication -> managed by enketo: Leave at `true` to use default "OpenRosa" form authentication provided by Aggregate/Formhub/KoBo/etc.
* authentication -> allow insecure transport: For development use, to test default form authentication on a server without an SSL certificate. Should be `false` on a production server to avoid sharing sensitive user credentials.
* authentication -> external login url that sets cookie: Will only be used if authentication -> managed by enketo is set to `false` and allows a deeper integration for a custom server. It contains a URL on your form/data server where Enketo should redirect a user to when the server returns a 401 response. That url should set a cookie that Enketo will pass to the server whenever it needs to retrieve a form resource or submit data. The url should contain a {RETURNURL} portion which Enketo will populate to send the user back to the webform once authentication has completed. See [README](../README.md#authentication) for more details.
* legacy formhub -> Formhub is a dead project and therefore has bugs that won't be fixed. Setting this setting to `true` temporarily works around some of these bugs to give you time to switch to a better alternative that is alive.

#### encryption key 
Enketo will use this to encrypt sensitive information whenever necessary (e.g. for the form server credentials that are stored in a cookie in the user's browser). Never share this key and never change it after the initial configuration (unless it was compromised). No specific key length requirements (I think).

#### default theme 
The theme to use if the survey has no user-or-api-defined theme. Values could be `"kobo"`, `"formhub"`, `"grid"`, or `"[yourowncustomtheme]"`.

#### themes supported
An array of theme names to enable. This can be used to disable certain themes. If this configuration item is absent or an empty array, all installed themes will be enabled.

#### support
* **email: The email address your users can contact when they experience problems with the service.**

#### google
* analytics -> ua: The UA (user agent) that Google has assigned to your domain if you choose to collect statistics on Enketo Express' usage using the Google Analytics service. Entirely optional.
* analytics -> domain: If you are running Enketo Express on a subdomain, you may need to add the subdomain there (without protocol), e.g. "odk.enke.to" for Google Analytics to pick up the data. When left empty (`""`) the value will be set to "auto" in the GA script.
* api key: The Google API key that is used for geolocation (in the geo widgets' search box). Can be obtained [here](https://console.developers.google.com/project). Make sure to enable the _GeoCoding API_ service. If you are using Google Maps layers, the same API key is used. Make sure to enable the _Google Maps JavaScript API v3_ service as well in that case (see next item).

#### maps
The `maps` configuration can include an array of Mapbox TileJSON objects (or a subset of these with at least a tiles (array) and an attribution property). You can also mix and match Google Maps layers. Below is an example of a mix of two map layers provided by OSM (in TileJSON format) and Google maps.

```
[ {
        "name": "street",
        "tiles": [ "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" ],
        "attribution": "Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors"
    }, {
        "name": "satellite",
        "tiles": "GOOGLE_SATELLITE"
} ]
```

For GMaps layers you have the four options as tiles values: `"GOOGLE_SATELLITE"`, `"GOOGLE_ROADMAP"`, `"GOOGLE_HYBRID"`, `"GOOGLE_TERRAIN"`. You can also add other TileJSON properties, such as minZoom, maxZoom, id to all layers. 

#### query parameter to pass to submission
For most form servers this item does nothing. If you would like to pass a particular ID to any online-only webform url as a query parameter and track submissions with this ID, you can provide the parameter name here. The parameter and its value will be copied to the submission URL.

#### redis
* main -> host: The IP address of the main redis database instance. If installed on the same server as Enketo Express, the value is `"127.0.0.1"`
* **main -> port: The port of the main redis database instance. This is the important persistent database that contains the unique IDs for each forms. The default value is `"6379"`**
* main -> password: Password of the main redis database instance. Usually `null`.
* cache -> host: The IP address of the cache redis database instance. If installed on the same server as Enketo Express, the value is `"127.0.0.1"`
* **cache -> port: The port of the cache redis database instance. This is the non-persistent database that is just used for caching to greatly improve performance. When testing or developing you could use one redis instance for both 'main' and 'cache' (e.g. both `"6379"`") but do not do this in production.**
* cache -> password: Password of the cache redis database instance. Usually `null`.

#### logo
* source: The logo at the top of each form. Can be a Data URI or just a path to a image file you place in public/images, e.g. `"/images/mylogo.png"`.
* href: The optional link to redirect to if the logo is clicked by the user.
