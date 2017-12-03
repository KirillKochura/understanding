import nerdamer from 'nerdamer';
const eps = 1e-7;

class ComplexExample {
  constructor(f, g) {
    this.f = nerdamer(f);
    this.g = nerdamer(g);
  }

  combine(combiner='chain') {
    const gvs = this.g.variables();
    const fvs = this.f.variables();
    if(gvs.length !== 1) return null;
    if(fvs.length !== 1) return null;
    const gv = gvs[0];
    const fv = gvs[0];
    switch(combiner) {
      case 'chain':
        return nerdamer(this.g.text(), {[gv]: this.f.text()});
      case 'add':
        return nerdamer(`${this.f.text()} + ${this.g.text()}`, {
          [fv]: 'x',
          [gv]: 'x',
        });
      default:
        return null;
    }
  }

  compare() {
    let max = 0;
    let bads = 0;
    const f = this.f.buildFunction();
    const g = this.g.buildFunction();
    for (let i = 0; i<200; i++) {
      const x = Math.random() * 100 - 50;
      try {
        if (isNaN(f(x)) || isNaN(g(x))) {
          bads += 1;
          if (bads > 20000) return false;
          i-=1;
          continue;
        }
        const diff = Math.abs(f(x) - g(x));
        max = diff > max ? diff : max;
      } catch (e) {
        i-=1;
      }
    }
    return max < eps;
  }
}

export default ComplexExample;
