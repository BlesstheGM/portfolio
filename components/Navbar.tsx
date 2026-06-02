export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#hero" className="navbar-brand">
        blessing<span>@portfolio</span>:~$
      </a>
      <ul className="navbar-links">
        <li><a href="#about">about</a></li>
        <li><a href="#experience">experience</a></li>
        <li><a href="#projects">projects</a></li>
        <li><a href="#coursework">coursework</a></li>
        <li><a href="#skills">skills</a></li>
        <li><a href="#contact">contact</a></li>
      </ul>
    </nav>
  );
}
