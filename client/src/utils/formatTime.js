// time conversion handler 
export const formatTime = (t) => {
    let hours = Math.floor(t/3600);
    let mins = Math.floor((t % 3600)/60);
    let secs = t % 60;

    if (hours > 0) {
        return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
