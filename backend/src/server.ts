import {WebSocketServer} from "ws";
import {InfluxDB, Point} from '@influxdata/influxdb-client'


const wss = new WebSocketServer({
  port: 8080,
});

const influxDB = new InfluxDB({
  url: 'http://localhost:8086',
  token: 'twY-MFx3DC8JS-YTKzpeFBVyrWC7RSlMNy21HSy6F9GilH17esyax1yOEOsNvjwM8sYGycV8IBtbcAKtZN5oTw=='
})

const writeApi = influxDB.getWriteApi('cf258c33f3371713', 'first_bucket')
const queryApi = influxDB.getQueryApi('cf258c33f3371713')



wss.on('connection', (ws, request) => {
  ws.send(JSON.stringify(`Connection established. Currently connected to ${wss.clients.size} clients`));

  // console.log(request.url, request.headers, request.connection.remoteAddress, request.connection.remotePort)

  // console.log(request.url?.toString())


  if (request.url === '/write') {
    console.log('Write connection opened')
    ws.on('message', async (message) => {
      const textMessage = JSON.parse(message.toString())
      console.log('Writing message: ', textMessage)

      if (textMessage.user && textMessage.xCoordinate && textMessage.yCoordinate) {
        writeApi.writePoint(new Point('coordinate_test')
          .tag('user', textMessage.user)
          .floatField('x-Coordinate', textMessage.xCoordinate)
          .floatField('y-Coordinate', textMessage.yCoordinate)
        )
        await writeApi.flush()
      }

      const dataPromise = queryApi.iterateRows('from(bucket: "first_bucket") |> range(start: -1h)')
      for await (const {values, tableMeta} of dataPromise) {
        const o = tableMeta.toObject(values)
        console.log(o)
      }


    })

  }



  // setInterval(() => {
  //   ws.send('Hello World')
  // }, 1000)

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})


