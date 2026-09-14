import {it,expect} from 'vitest'
import {VisibleDwell} from '@/lib/ab/visible-dwell'
it('counts visible intervals only and consumes exit once',()=>{const d=new VisibleDwell();expect(d.update(true,0)).toBe(0);expect(d.update(false,100)).toBe(100);expect(d.update(false,1000)).toBe(0);expect(d.update(true,2000)).toBe(0);expect(d.update(false,2050)).toBe(50);expect(d.update(false,2050)).toBe(0)})
