import { HueLabsHomebridgePlatform } from './platform';
import fetch from 'node-fetch';

export class HueApi {

    private gateway: string;
    private token: string;

    constructor(gateway: string, token: string, private readonly platform: HueLabsHomebridgePlatform) {
      this.gateway = gateway;
      this.token = token;
    }

    public async getLabsFormulars() {
      const response = await fetch(`http://${this.gateway}/api/${this.token}/sensors`, {
        'method': 'GET',
      })
        .then((res) => res.json());
      const labsKeys = Object.keys(response).filter(key => {
        return response[key].modelid === 'HUELABSVTOGGLE';
      });

      const labsFormulas = labsKeys.map(key => ({
        ...response[key],
        id: key,
      }));
      return labsFormulas;
    }

    public getLabsStatus(id: string) {
      return fetch(`http://${this.gateway}/api/${this.token}/sensors/${id}`, {
        'method': 'GET',
      })
        .then((res) => res.json());
    }

    public setLabStatus(id: string, status: boolean) : void {
      this.platform.log.debug(`Setting status ${status} for id ${id}`);
      return fetch(`http://${this.gateway}/api/${this.token}/sensors/${id}/state`, {
        'method': 'PUT',
        'headers': {
          'Content-Type': 'application/json; charset=utf-8',
        },
        'body': `{"status":${status ? 1 : 0}}`,
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