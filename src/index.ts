import { apollo, gql } from '@elysiajs/apollo'
import { cors } from '@elysiajs/cors'
import { websocket } from '@elysiajs/websocket'
import { Elysia, t } from 'elysia'
import EventEmitter from 'events'

const ee = new EventEmitter()

const EVENTS = {
	NEW_MESSAGE: 'newMessage',
	NEW_USER: 'newUser',
	NEW_ROOM: 'newRoom',
	NEW_ROOM_MESSAGE: 'newRoomMessage',
} as const

const app = new Elysia()
	.use(cors())
	.use(websocket())
	.get('/', () => 'Hello World!')
	.ws('/chat', {
		open(ws) {
			const { room, username } = ws.data.query

			ws.subscribe(room)
			ws.publish(room, {
				message: `${username} has enter the room`,
				username: 'notice',
				time: Date.now(),
			})
		},
		message(ws, message) {
			const { room, username } = ws.data.query

			ws.publish(room, {
				message,
				username: username,
				time: Date.now(),
			})
		},
		close(ws) {
			const { room, username } = ws.data.query

			ws.unsubscribe(room)
			ws.publish(room, {
				message: `${username} has leave the room`,
				username: 'notice',
				time: Date.now(),
			})
		},
		schema: {
			query: t.Object({
				room: t.String(),
				username: t.String(),
			}),
			response: t.Object({
				message: t.String(),
				username: t.String(),
				time: t.Number(),
			}),
		},
	})
	.ws('/app', {
		open(ws) {
			const { username: userId } = ws.data.query

			ws.subscribe(userId).publish(userId, {
				status: 'online',
			})
		},
		message(ws, message) {
			const { username } = ws.data.query
		},
		close(ws) {
			const { username: userId } = ws.data.query

			ws.unsubscribe(userId).publish(userId, {
				status: 'offline',
			})
		},
		schema: {
			query: t.Object({
				username: t.String(),
			}),
			response: t.Object({
				status: t.String(),
			}),
		},
	})
	.ws('/cursor', {
		open(ws) {
			const { room, username } = ws.data.query

			ws.subscribe(room).publish(room, {
				cursor: {
					x: 0,
					y: 0,
				},
				username: 'notice',
				time: Date.now(),
			})
		},
		message(ws, message) {
			const { room, username } = ws.data.query

			ws.publish(room, {
				cursor: message,
				username: username,
				time: Date.now(),
			})
		},
		close(ws) {
			const { room } = ws.data.query

			ws.unsubscribe(room)
		},
		schema: {
			query: t.Object({
				room: t.String(),
				username: t.String(),
			}),
			response: t.Object({
				cursor: t.Object({
					x: t.Number(),
					y: t.Number(),
				}),
				username: t.String(),
				time: t.Number(),
			}),
			body: t.Object({
				x: t.Number(),
				y: t.Number(),
			}),
		},
	})
	.listen(3000)

export type App = typeof app

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`)
