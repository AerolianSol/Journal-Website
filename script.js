
// STORAGE_KEY in localStorage
const STORAGE_KEY = 'journal.entries.v1'

const journalForm = document.getElementById('journalForm')
const titleInput = document.getElementById('title')
const contentInput = document.getElementById('content')
const entryIdInput = document.getElementById('entryId')
const entriesList = document.getElementById('entriesList')
const cancelEditBtn = document.getElementById('cancelEdit')
const deleteAllBtn = document.getElementById('deleteAllBtn')

let entries = []

function loadEntries(){
	try{
		const raw = localStorage.getItem(STORAGE_KEY)
		entries = raw ? JSON.parse(raw) : []
	}
    catch(e){
		console.error('Failed to load entries', e)
		entries = []
	}
}

function saveEntries(){
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function renderEntries(){
	entriesList.innerHTML = ''

	if(entries.length === 0){
		const el = document.createElement('div')
		el.className = 'entry-card'
		el.innerHTML = '<div class="entry-meta">No entries yet — write your first one.</div>'
		entriesList.appendChild(el)
		return
	}

	entries.slice().reverse().forEach(entry => {
		const card = document.createElement('div')
		card.className = 'entry-card'

		const head = document.createElement('div')
		head.className = 'entry-head'

		const title = document.createElement('h3')
		title.className = 'entry-title'
		title.textContent = entry.title || '(untitled)'

		const meta = document.createElement('div')
		meta.className = 'entry-meta'
		const created = new Date(entry.createdAt)
		let metaText = created.toLocaleString()
		meta.textContent = metaText

		head.appendChild(title)
		head.appendChild(meta)

		const content = document.createElement('div')
		content.className = 'entry-content'
		content.textContent = entry.content

		const actions = document.createElement('div')
		actions.className = 'entry-actions'

		const editBtn = document.createElement('button')
		editBtn.textContent = 'Edit'
		editBtn.type = 'button'
		editBtn.addEventListener('click', ()=> startEdit(entry.id))

		const delBtn = document.createElement('button')
		delBtn.textContent = 'Delete'
		delBtn.type = 'button'
		delBtn.className = 'danger'
		delBtn.addEventListener('click', ()=> deleteEntry(entry.id))

		actions.appendChild(editBtn)
		actions.appendChild(delBtn)

		card.appendChild(head)
		card.appendChild(content)
		card.appendChild(actions)

		if(entry.updatedAt && entry.updatedAt > entry.createdAt){
			const updatedEl = document.createElement('div')
			updatedEl.className = 'entry-updated'
			updatedEl.textContent = 'Edited: ' + new Date(entry.updatedAt).toLocaleString()
			card.appendChild(updatedEl)
		}

		entriesList.appendChild(card)
	})

	if(deleteAllBtn){
		deleteAllBtn.disabled = entries.length === 0
	}
}

function createEntry({title, content}){
	const entry = {id: Date.now().toString(), title, content, createdAt: Date.now(), updatedAt: Date.now()}
	entries.push(entry)
	saveEntries()
	renderEntries()
}

function updateEntry(id, {title, content}){
	const idx = entries.findIndex(e=> e.id === id)
	if(idx === -1) return
	entries[idx].title = title
	entries[idx].content = content
	entries[idx].updatedAt = Date.now()
	saveEntries()
	renderEntries()
}

function deleteEntry(id){
	if(!confirm('Delete this entry? This cannot be undone.')) return
	entries = entries.filter(e=> e.id !== id)
	saveEntries()
	renderEntries()
}

function startEdit(id){
	const entry = entries.find(e=> e.id === id)
	if(!entry) return
	entryIdInput.value = entry.id
	titleInput.value = entry.title
	contentInput.value = entry.content
	cancelEditBtn.classList.remove('hidden')
	titleInput.focus()
}

function resetForm(){
	entryIdInput.value = ''
	journalForm.reset()
	cancelEditBtn.classList.add('hidden')
}

journalForm.addEventListener('submit', e=>{
	e.preventDefault()
	const title = titleInput.value.trim()
	const content = contentInput.value.trim()
	if(!content){
		alert('Please fill out the entry before submitting.')
		return
	}

	const existingId = entryIdInput.value
	if(existingId){
		updateEntry(existingId, {title, content})
	}
	else{
		createEntry({title, content})
	}

	resetForm()
})

cancelEditBtn.addEventListener('click', ()=> resetForm())

deleteAllBtn.addEventListener('click', ()=>{
		if(entries.length === 0) return
		if(!confirm('Delete all entries? This cannot be undone.')) return
		entries = []
		saveEntries()
		renderEntries()
})

loadEntries()
renderEntries()
