import { MouseEventHandler, useCallback, useEffect, useState } from 'react'
import { api } from '../App'
import { useUserStore } from '../store/user'

type Cursor = ReturnType<typeof api['cursor']['subscribe']>

export default function CursorPage() {
	const { user } = useUserStore()
	const [cursor, setCursor] = useState<Cursor | null>(null)
	const [remoteCursor, setRemoteCursor] = useState({ x: 0, y: 0 })
	const [remoteUser, setRemoteUser] = useState('')

	useEffect(() => {
		const c = api.cursor
			.subscribe({
				$query: {
					room: 'cursor',
					username: user?.username ?? 'unknown',
				},
			})
			.on('message', ws => {
				setRemoteCursor(ws.data.cursor)
				setRemoteUser(ws.data.username)
			})

		setCursor(c)
	}, [user?.username])

	// useEffect(() => {
	//   if (cursor) {
	//     cursor.on('message', ws => {
	//       setRemoteCursor(ws.data.cursor)
	//     })
	//   }
	// }, [cursor])

	const handleMouseMove = useCallback(
		(e: MouseEventHandler<HTMLDivElement>) => {
			if (cursor) {
				cursor.send({ x: e.clientX, y: e.clientY })
			}
		},
		[cursor]
	)

	return (
		<div>
			<h1>{JSON.stringify(remoteCursor)}</h1>
			<div
				style={{
					position: 'absolute',
					transform: `translate(${remoteCursor.x}px, ${remoteCursor.y}px)`,
					cursor: 'none',
					transition: 'all 0.04s ease 0s',
				}}
			>
				{remoteUser}
			</div>
			<div
				style={{
					width: '100vw',
					height: '100vh',
					cursor: 'none',
				}}
				onMouseMove={handleMouseMove}
			></div>
		</div>
	)
}
