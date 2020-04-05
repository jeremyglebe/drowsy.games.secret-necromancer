function cardOverlap(sprite1, sprite2) {
    if (Math.abs(sprite1.x - sprite2.x) < sprite1.width) return true;
    if (Math.abs(sprite1.y - sprite2.y) < sprite1.height) return true;
    return false;
}

module.exports = {
    cardOverlap: cardOverlap
}