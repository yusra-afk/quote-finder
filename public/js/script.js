document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", async function () {
        const id = this.id;
        const response = await fetch(`/api/author/${id}`);
        const data = await response.json();
  
        let html = "";
        data.forEach(author => {
          html += `<p><strong>${author.firstName} ${author.lastName}</strong></p>
                   <p>${author.dob} - ${author.dod}</p>
                   <p>${author.bio}</p>`;
        });
  
        document.getElementById("authorInfo").innerHTML = html;
        const myModal = new bootstrap.Modal(document.getElementById('authorModal'));
        myModal.show();
      });
    });
  });