import * as ws from 'ws';
import { RuleEngine } from '../engine/RuleEngine';
import { Server } from './server';

export interface IMessage {
  topic: string;
  content: any;
}

export class Gui {

  constructor(private port: number, private ruleEngine: RuleEngine) {
    Server.create('./gui', port + 1);

    var WebSocketServer = ws.Server
      , wss = new WebSocketServer({ port: 8123 });

    var send = (client: ws, topic: string, content: any) => {
      client.send(JSON.stringify({
        topic: topic,
        content: content
      }), err => {
        if (err) console.error(err);
      });
    };

    var broadcast = (topic: string, data: any) => {
      wss.clients.forEach(client => {
        send(client, topic, data);
      });
    };

    wss.on('connection', (ws) => {
      ws.on('message', message => {
        let msgType = typeof message;
        console.log('Message type: ' + msgType);
        try {
          let msg = JSON.parse(message);
          this.process(msg);
        } catch (ex) {
          console.log('String received: ' + message);
        }
      });

      send(ws, 'rules', ruleEngine.rules);
      send(ws, 'features', ruleEngine.worldState.features);
    });

    ruleEngine.on('evaluation_ready', () => {
      broadcast('rules', ruleEngine.rules);
      broadcast('features', ruleEngine.worldState.features);
    });
  }

  /**
   * Process a received message.
   *
   * @param {{ topic: string, content: any }} msg
   * @returns
   */
  process(msg: IMessage) {
    switch (msg.topic) {
      case 'execute':
        this.executeRule(msg);
        break;
      default:
        console.warn(`Unknown JSON Message received: ${JSON.stringify(msg, null, 2)}`);
        break;
    }
  }

  /**
   * Execute a rule's actions
   *
   * @param {IMessage} msg
   * @returns
   */
  executeRule(msg: IMessage) {
    let rule = msg.content;
    if (!rule.hasOwnProperty('id')) {
      console.error(`Unknown rule received: ${JSON.stringify(msg, null, 2)}`);
      return;
    }
    this.ruleEngine.rules.some(r => {
      if (r.id !== rule.id) return false;
      r.actions.forEach(a => a.run(this.ruleEngine.worldState));
      return true;
    });
  }

}
