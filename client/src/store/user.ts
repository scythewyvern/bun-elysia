import { proxy, subscribe, useSnapshot } from 'valtio'

interface User {
	username: string
}

interface UserStore {
	user: User | null
	login: (username: User) => void
	logout: () => void
}

const initialUser = JSON.parse(localStorage.getItem('user') || '{}') as User

export const userStore = proxy<UserStore>({
	user: initialUser,
	login: user => {
		userStore.user = user
	},
	logout: () => {
		userStore.user = null
	},
})

export const useUserStore = () => useSnapshot(userStore)

subscribe(userStore, () => {
	localStorage.setItem('user', JSON.stringify(userStore.user))
})
