function formatMOrSOrH(mOrSOrH) {
  mOrSOrH = mOrSOrH + ""
  if (mOrSOrH.length == 1) {
    return "0" + mOrSOrH
  }
  return mOrSOrH
}

function render(members) {
  let maxDay = 0
  let list = []

  Object.keys(members).forEach(d => {
    const u = members[d]
    const dayCount = Object.keys(u.completion_day_level).length
    if (dayCount > maxDay) {
      maxDay = dayCount
    }
    list.push({ name: u.name, t: u.completion_day_level })
  })
  if (maxDay == 0) {
    return
  }
  function renderHead() {
    const tableHead = document.createElement('thead')
    document.querySelector('table').appendChild(tableHead)
    const tr = document.createElement('tr')
    tableHead.appendChild(tr)
    const th = document.createElement('th')
    th.className = "col"
    th.innerText = "User ID"
    tr.appendChild(th)
    for (let i = 0; i < maxDay * 2; i++) {
      const th = document.createElement('th')
      th.className = "col"
      th.innerText = `Day ${Math.floor(i / 2) + 1} ` + (i % 2 == 0 ? "A" : "B")
      tr.appendChild(th)
    }
  }
  renderHead()

  const tbody = document.createElement('tbody')
  document.querySelector('table').appendChild(tbody)
  function renderRow(user) {
    const tr = document.createElement('tr')
    tbody.appendChild(tr)
    const th = document.createElement('th')
    th.innerText = user.name
    tr.appendChild(th)
    th.setAttribute('scope', "row")
    for (let i = 0; i < maxDay * 2; i++) {
      const td = document.createElement('td')
      const day = Math.floor(i / 2) + 1
      const qIndex = i % 2 + 1
      if (!user.t[day] || !user.t[day][qIndex]) {
        td.innerText = "In Progress"
        tr.appendChild(td)
        continue
      }
      const t = Number.parseInt(user.t[day][qIndex].get_star_ts) * 1000
      const date = new Date(t)
      const timeToSecond = `${formatMOrSOrH(date.getHours())}:${formatMOrSOrH(date.getMinutes())}:${formatMOrSOrH(date.getSeconds())}`
      td.innerText = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${timeToSecond}`
      tr.appendChild(td)
    }
  }
  list.forEach((d, i) => renderRow(d, i))
}

fetch('http://ec2-13-239-55-237.ap-southeast-2.compute.amazonaws.com/373005')
  .then(d => d.json().then(data => {
    render(data.members)
  }))
