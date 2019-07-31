import Link from "next/link";

const Home = props => (
  <div>
    <Link href="/addmatch">
      <a>Add New Match</a>
    </Link>
    <img src="/static/images/Aatrox.png" alt="Aatrox" />
  </div>
);

export default Home;
