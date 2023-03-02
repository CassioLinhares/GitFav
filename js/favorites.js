class GithubUser { //vai na api buscar os dados e me retorna um {com os dados transformados em json}
    static async search(username) {
        const endPoint = `https://api.github.com/users/${username}`

        const data = await fetch(endPoint)
        const data_1 = await data.json()
        return ({
            login: data_1.login,
            name: data_1.name,
            public_repos: data_1.public_repos,
            followers: data_1.followers
        })
    }
}

class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    async addFavorite(username) {
        try {
            const isequals = this.entries.find(user => user.login === username)

            if (isequals) {
                throw new Error('Usuário já cadastrado')
            }

            if (username === '') {
                throw new Error('Preencha o campo com um nome de usuário válido!')
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined || user.name === null) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch (error) {
            alert(error.message)
        }

    }

    save() {
        localStorage.setItem('@github-Favorites:', JSON.stringify(this.entries))
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-Favorites:')) || []
    }

    delete(user) {
        const filterEntries = this.entries.filter(entry => entry.login !== user.login)
        // console.log(filterEntries)
        this.entries = filterEntries
        this.update()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('.hide')
        this.tfootEmpty = this.root.querySelector('.empty-fav')
        this.update()
        this.btnFav()
    }

    btnFav() {
        const btnFav = this.root.querySelector('.btnFav')
        btnFav.onclick = () => {
            this.handleInput()
        }
        this.root.onkeydown = (event) => {
            if (event.keyCode === 13) {
                this.handleInput()
            }
        }
    }

    handleInput() {
        if (this.entries === 0) {
            this.screenToggle2()
            // console.log(this.entries)
        }
        const { value } = this.root.querySelector('#input-search')
        this.root.querySelector('#input-search').value = ''
        this.addFavorite(value.toLowerCase())
    }

    update() {
        this.removeAllTr()
        if (this.entries.length === 0) {
            this.screenToggle2()
            this.save()
        }

        if (this.entries.length !== 0) {
            this.screenToggle()
            this.save()
        }

        this.entries.forEach(user => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user a p').textContent = `${user.name}`
            row.querySelector('.user a span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = `${user.public_repos}`
            row.querySelector('.Followers').textContent = `${user.followers}`

            row.querySelector('.btn-remove button').onclick = () => {
                const isOK = confirm('Tem certeza que deseja excluir este usuário?')
                if (isOK) {
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })
    }

    createRow() {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td class="user">
                 <img src="https://github.com/diego3g.png" alt="imagem de Usuário">
                 <a href="https://github.com/diego3g" target="_blank">
                    <p>Diego Fernandes</p>
                    <span>/diego3g</span>
                </a>
            </td>
            <td class="repositories">123</td>
            <td class="Followers">1234</td>
            <td class="btn-remove">
                <button>remover</button>
            </td>
        `
        return tr
    }

    screenToggle() {
        this.tbody.classList.remove('hide')
        this.tfootEmpty.classList.add('hide')
    }

    screenToggle2() {
        this.tbody.classList.add('hide')
        this.tfootEmpty.classList.remove('hide')
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
    }
}

