function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
}

function showProfile(profileId) {
    const profiles = document.querySelectorAll('.profile-detail');
    profiles.forEach(profile => {
        profile.classList.add('hidden');
    });

    const profileToShow = document.getElementById(profileId);
    if (profileToShow) {
        profileToShow.classList.remove('hidden');
    }
}