import { HueLabsHomebridgePlatform } from './platform';
const fetch = require('node-fetch');

export class HueApi {

    private gateway: String;
    private token: String; 

    constructor(gateway: String, token: String, private readonly platform: HueLabsHomebridgePlatform) {
        this.gateway = gateway;
        this.token = token;
    }

    public async getLabsFormulars() {
        let response = await fetch(`http://${this.gateway}/api/${this.token}/sensors`, {
            "method": "GET"
        })
        .then((res) => res.json());
        let labsKeys = Object.keys(response).filter(key => {
            return response[key].modelid == "HUELABSVTOGGLE"
        });

        let labsFormulas = labsKeys.map(key => ({
            ...response[key],
            id: key
        }));
        return labsFormulas;
    }

    public getLabsStatus(id: String) {
        return fetch(`http://${this.gateway}/api/${this.token}/sensors/${id}`, {
            "method": "GET"
        })
        .then((res) => res.json())
    }

    public setLabStatus(id: String, status: boolean) : void {
        this.platform.log.debug(`Setting status ${status} for id ${id}`);
        return fetch(`http://${this.gateway}/api/${this.token}/sensors/${id}/state`, {
            "method": "PUT",
            "headers": {
                  "Content-Type": "application/json; charset=utf-8"
            },
            "body": `{"status":${status ? 1 : 0}}`
       })
       .then((res) => res.text())
       .then(res => {
          this.platform.log.debug(`response: ${res}`);
       })
       .catch(error => {
          this.platform.log.error(`Error updating lab status: ${error}`);
       });
    }
}